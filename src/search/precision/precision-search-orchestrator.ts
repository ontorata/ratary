import type { Env } from '../../config/env.js';
import type { IEmbeddingProvider } from '../../embedding/embedding.provider.interface.js';
import type { IEmbeddingStore } from '../../embedding/embedding.store.interface.js';
import type { IMemoryReader } from '../../repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../../repositories/memory-relation.repository.interface.js';
import type { SearchFilters } from '../../types/memory-persistence.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  ByPathQuery,
  ByPathResult,
  PrecisionSearchMode,
  PrecisionSearchRequest,
  PrecisionSearchResponse,
  SimilarMemoryQuery,
} from '../../types/precision-search.js';
import { NotFoundError } from '../../types/errors.js';
import { workspaceIdFromScope } from '../../repositories/repository-scope.js';
import { SEARCH_CANDIDATE_CAP } from '../ranking.config.js';
import { rankMemories } from '../ranking.engine.js';
import type { ScoredMemory } from '../search.service.js';
import type { IReranker } from '../rerank/ireranker.port.js';
import { capSearchQueries } from './cap-search-queries.js';
import { parseIgnorePatterns } from './ignore-patterns.js';
import type { IPrecisionSearchService } from './iprecision-search-service.interface.js';
import { MultiQueryRrfFusion } from './multi-query-rrf.js';
import { rankTitleMode, suggestSimilarPaths } from './fuzzy-title-matcher.js';
import { rankFulltextMode, SearchResultEnricher } from './search-result-enricher.js';

export class PrecisionSearchOrchestrator implements IPrecisionSearchService {
  private readonly fusion = new MultiQueryRrfFusion();
  private readonly enricher: SearchResultEnricher;

  constructor(
    private readonly reader: IMemoryReader,
    relations: IMemoryRelationRepository,
    private readonly embeddingStore: IEmbeddingStore | undefined,
    private readonly embeddingProvider: IEmbeddingProvider | undefined,
    private readonly reranker: IReranker,
    private readonly env: Env,
  ) {
    this.enricher = new SearchResultEnricher(reader, relations);
  }

  async search(
    scope: MemoryScope,
    request: PrecisionSearchRequest,
  ): Promise<PrecisionSearchResponse> {
    const mode = request.mode ?? (this.env.SEARCH_DEFAULT_MODE as PrecisionSearchMode);
    const warnings: string[] = [];
    const capped = capSearchQueries(request.queries, this.env.SEARCH_MAX_QUERIES);
    const queries = capped.queries;
    if (capped.truncated) {
      warnings.push(
        `queries_truncated:${capped.originalCount}->${this.env.SEARCH_MAX_QUERIES}`,
      );
    }

    if (capped.originalCount === 0 && !request.filters && !request.tag && !request.project) {
      const listed = await this.reader.findAll({
        ownerId: scope.ownerId,
        workspaceId: workspaceIdFromScope(scope),
        archived: request.archived ?? false,
        limit: request.limit ?? 50,
        offset: request.offset ?? 0,
      });
      return {
        hits: listed.memories.map((memory) => ({ ...memory, relevanceScore: 0 })),
        total: listed.total,
        mode,
      };
    }

    const perQuery = new Map<string, Array<ScoredMemory>>();

    for (const query of queries) {
      const ranked = await this.searchSingleQuery(scope, request, query.trim(), mode, warnings);
      perQuery.set(query, ranked);
    }

    const fused =
      perQuery.size > 1
        ? this.fusion.fuse(perQuery, { k: this.env.MULTI_QUERY_RRF_K })
        : [...perQuery.values()][0] ?? [];

    let hits: ScoredMemory[] = fused;
    const primaryQuery = queries[0] === '' ? '' : queries[0] ?? '';

    if (request.rerank && this.env.SEARCH_RERANK_ENABLED && primaryQuery) {
      const reranked = await this.reranker.rerank(
        primaryQuery,
        hits,
        request.limit ?? hits.length,
      );
      hits = reranked;
    }

    const enriched = await this.enricher.enrich(scope, hits, {
      query: primaryQuery,
      snippetLength: request.snippetLength ?? 200,
      linkCap: this.env.SEARCH_ENRICH_LINK_CAP,
      extended: request.extended ?? false,
    });

    const offset = request.offset ?? 0;
    const limit = request.limit ?? 50;
    const page = enriched.slice(offset, offset + limit);

    return {
      hits: page,
      total: enriched.length,
      mode,
      warnings: warnings.length ? warnings : undefined,
    };
  }

  async findSimilar(
    scope: MemoryScope,
    query: SimilarMemoryQuery,
  ): Promise<PrecisionSearchResponse> {
    const workspaceId = workspaceIdFromScope(scope);
    const target = await this.resolveTargetMemory(scope, query);
    if (!target) {
      throw new NotFoundError('Memory', query.memoryId ?? query.slug ?? query.sourcePath ?? 'unknown');
    }

    const warnings: string[] = [];
    let ranked: ScoredMemory[] = [];

    if (this.embeddingProvider && this.embeddingStore && this.env.EMBEDDING_PROVIDER !== 'noop') {
      const stored = await this.embeddingStore.findByMemoryId(
        target.id,
        scope.ownerId,
        this.embeddingProvider.modelId,
      );
      if (stored) {
        const matches = await this.embeddingStore.searchSimilar(
          stored.vector,
          scope.ownerId,
          SEARCH_CANDIDATE_CAP,
        );
        const ids = matches
          .filter((match) => match.memoryId !== target.id)
          .map((match) => match.memoryId);
        const memories = await this.reader.findByIds(ids, scope.ownerId, workspaceId);
        const scoreById = new Map(matches.map((match) => [match.memoryId, match.score]));
        ranked = memories
          .map((memory) => ({
            ...memory,
            relevanceScore: Math.round((scoreById.get(memory.id) ?? 0) * 100),
          }))
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
    }

    if (ranked.length === 0) {
      warnings.push('vector_unavailable_fallback');
      const candidates = await this.reader.findSearchCandidates({
        ownerId: scope.ownerId,
        workspaceId,
        query: target.title,
        limit: SEARCH_CANDIDATE_CAP,
        offset: 0,
        archived: false,
      });
      ranked = rankMemories(
        candidates.memories.filter((memory) => memory.id !== target.id),
        { q: target.title },
      ).filter((memory) => memory.relevanceScore > 0);
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 10;
    const page = ranked.slice(offset, offset + limit);

    return {
      hits: page,
      total: ranked.length,
      mode: 'semantic',
      warnings: warnings.length ? warnings : undefined,
    };
  }

  async getByPath(scope: MemoryScope, query: ByPathQuery): Promise<ByPathResult> {
    const workspaceId = workspaceIdFromScope(scope);
    const memory = await this.reader.findBySourcePath(scope.ownerId, query.path, workspaceId);

    if (memory) {
      const enriched = await this.enricher.enrich(
        scope,
        [{ ...memory, relevanceScore: 100 }],
        {
          snippetLength: 200,
          linkCap: this.env.SEARCH_ENRICH_LINK_CAP,
          extended: true,
        },
      );
      return { memory: enriched[0] };
    }

    if (!query.suggest) {
      throw new NotFoundError('Memory', query.path);
    }

    const listed = await this.reader.findAll({
      ownerId: scope.ownerId,
      workspaceId,
      archived: false,
      limit: 200,
      offset: 0,
    });
    const paths = listed.memories
      .map((item) => item.sourcePath)
      .filter((path): path is string => Boolean(path));

    return {
      suggestions: suggestSimilarPaths(query.path, paths, 3),
    };
  }

  private async searchSingleQuery(
    scope: MemoryScope,
    request: PrecisionSearchRequest,
    query: string,
    mode: PrecisionSearchMode,
    warnings: string[],
  ): Promise<ScoredMemory[]> {
    const filters = this.buildSearchFilters(scope, request, query);
    const { memories } = await this.reader.findSearchCandidates(filters);

    switch (mode) {
      case 'title':
        return rankTitleMode(
          memories,
          query,
          this.env.TITLE_FUZZY_BOOST,
          this.env.ALIAS_EXACT_BOOST,
        );
      case 'fulltext':
        return rankFulltextMode(memories, query);
      case 'semantic':
        return this.searchSemantic(scope, query, memories, warnings);
      case 'hybrid':
      default:
        return this.searchHybrid(scope, query, memories, warnings);
    }
  }

  private async searchHybrid(
    scope: MemoryScope,
    query: string,
    sqlCandidates: Awaited<ReturnType<IMemoryReader['findSearchCandidates']>>['memories'],
    warnings: string[],
  ): Promise<ScoredMemory[]> {
    const lexical = rankMemories(sqlCandidates, { q: query, tag: undefined });
    if (!query.trim()) return lexical;

    const semantic = await this.searchSemantic(scope, query, sqlCandidates, warnings);
    if (semantic.length === 0) return lexical;

    const fused = this.fusion.fuse(
      new Map([
        ['lexical', lexical],
        ['semantic', semantic],
      ]),
      { k: this.env.MULTI_QUERY_RRF_K },
    );
    return fused;
  }

  private async searchSemantic(
    scope: MemoryScope,
    query: string,
    fallbackCandidates: Awaited<ReturnType<IMemoryReader['findSearchCandidates']>>['memories'],
    warnings: string[],
  ): Promise<ScoredMemory[]> {
    if (!query.trim()) {
      return rankMemories(fallbackCandidates, { q: query });
    }

    if (!this.embeddingProvider || !this.embeddingStore || this.env.EMBEDDING_PROVIDER === 'noop') {
      warnings.push('semantic_degraded_to_lexical');
      return rankMemories(fallbackCandidates, { q: query });
    }

    const [embedded] = await this.embeddingProvider.embed([{ memoryId: 'query', text: query }]);
    const matches = await this.embeddingStore.searchSimilar(
      embedded.vector,
      scope.ownerId,
      SEARCH_CANDIDATE_CAP,
    );
    if (matches.length === 0) {
      warnings.push('semantic_no_vector_matches');
      return rankMemories(fallbackCandidates, { q: query });
    }

    const workspaceId = workspaceIdFromScope(scope);
    const ids = matches.map((match) => match.memoryId);
    const memories = await this.reader.findByIds(ids, scope.ownerId, workspaceId);
    const scoreById = new Map(matches.map((match) => [match.memoryId, match.score]));

    return memories
      .map((memory) => ({
        ...memory,
        relevanceScore: Math.round((scoreById.get(memory.id) ?? 0) * 100),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private buildSearchFilters(
    scope: MemoryScope,
    request: PrecisionSearchRequest,
    query: string,
  ): SearchFilters {
    return {
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope),
      query: query || undefined,
      tag: request.tag,
      project: request.project,
      category: request.category,
      memoryType: request.memoryType as SearchFilters['memoryType'],
      importanceMin: request.importanceMin,
      favorite: request.favorite,
      archived: request.archived,
      grammar: request.filters,
      ignorePatterns: parseIgnorePatterns(this.env.SEARCH_IGNORE_PATTERNS),
      limit: SEARCH_CANDIDATE_CAP,
      offset: 0,
    };
  }

  private async resolveTargetMemory(scope: MemoryScope, query: SimilarMemoryQuery) {
    const workspaceId = workspaceIdFromScope(scope);
    if (query.memoryId) {
      return this.reader.findById(query.memoryId, scope.ownerId, workspaceId);
    }
    if (query.slug) {
      return this.reader.findBySlug(scope.ownerId, query.slug, workspaceId);
    }
    if (query.sourcePath) {
      return this.reader.findBySourcePath(scope.ownerId, query.sourcePath, workspaceId);
    }
    return null;
  }
}
