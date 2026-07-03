import type { SearchFilters } from '../types/memory-persistence.js';
import type { IMemoryReader } from '../repositories/memory.repository.interface.js';
import type { Memory } from '../types/memory.js';
import type { SearchQuery } from '../types/memory.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';
import { SEARCH_CANDIDATE_CAP } from './ranking.config.js';
import { rankMemories } from './ranking.engine.js';

export interface ScoredMemory extends Memory {
  relevanceScore: number;
}

export class SearchService {
  constructor(private readonly repository: IMemoryReader) {}

  async search(
    scope: MemoryScope,
    query: SearchQuery,
  ): Promise<{ memories: ScoredMemory[]; total: number }> {
    const filters: SearchFilters = {
      ownerId: scope.ownerId,
      workspaceId: workspaceIdFromScope(scope),
      query: query.q,
      tag: query.tag,
      project: query.project,
      category: query.category,
      memoryType: query.memory_type,
      importanceMin: query.importance_min,
      favorite: query.favorite,
      archived: query.archived,
      limit: SEARCH_CANDIDATE_CAP,
      offset: 0,
    };

    const { memories: candidates, total } = await this.repository.findSearchCandidates(filters);

    const ranked = rankMemories(candidates, { q: query.q, tag: query.tag });

    const filtered = query.q || query.tag ? ranked.filter((m) => m.relevanceScore > 0) : ranked;

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 50;
    const page = filtered.slice(offset, offset + limit);

    return {
      memories: page,
      total: query.q || query.tag ? filtered.length : total,
    };
  }
}
