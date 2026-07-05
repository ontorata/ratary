import type { IMemoryReader } from '../../repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../../repositories/memory-relation.repository.interface.js';
import type { Memory } from '../../types/memory.js';
import type { PrecisionSearchHit, PrecisionSearchLink } from '../../types/precision-search.js';
import type { ScoredMemory } from '../search.service.js';
import { workspaceIdFromScope } from '../../repositories/repository-scope.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export interface EnrichSearchHitsOptions {
  query?: string;
  snippetLength: number;
  linkCap: number;
  extended: boolean;
}

export interface ISearchResultEnricher {
  enrich(
    scope: MemoryScope,
    hits: ScoredMemory[],
    options: EnrichSearchHitsOptions,
  ): Promise<PrecisionSearchHit[]>;
}

function extractSnippet(text: string, query: string | undefined, maxLength: number): string {
  if (maxLength <= 0) return '';
  const normalized = text.trim();
  if (!normalized) return '';

  if (query?.trim()) {
    const idx = normalized.toLowerCase().indexOf(query.trim().toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - Math.floor(maxLength / 4));
      const end = Math.min(normalized.length, start + maxLength);
      return normalized.slice(start, end);
    }
  }

  return normalized.slice(0, maxLength);
}

export class SearchResultEnricher implements ISearchResultEnricher {
  constructor(
    private readonly reader: IMemoryReader,
    private readonly relations: IMemoryRelationRepository,
  ) {}

  async enrich(
    scope: MemoryScope,
    hits: ScoredMemory[],
    options: EnrichSearchHitsOptions,
  ): Promise<PrecisionSearchHit[]> {
    if (!options.extended && options.snippetLength <= 0) {
      return hits;
    }

    const workspaceId = workspaceIdFromScope(scope);
    const titleById = new Map<string, string>();

    const enriched: PrecisionSearchHit[] = [];

    for (const hit of hits) {
      const base: PrecisionSearchHit = { ...hit };

      if (options.snippetLength > 0) {
        const snippet =
          extractSnippet(hit.summary, options.query, options.snippetLength) ||
          extractSnippet(hit.content, options.query, options.snippetLength);
        base.snippet = snippet;
      }

      if (options.extended) {
        const relations = await this.relations.findByMemoryId(hit.id, scope.ownerId, workspaceId);
        const outgoingLinks: PrecisionSearchLink[] = [];
        const backlinks: PrecisionSearchLink[] = [];

        for (const relation of relations) {
          if (outgoingLinks.length + backlinks.length >= options.linkCap) break;

          if (relation.sourceMemoryId === hit.id) {
            outgoingLinks.push({
              memoryId: relation.targetMemoryId,
              relation: relation.relation,
            });
          } else if (relation.targetMemoryId === hit.id) {
            backlinks.push({
              memoryId: relation.sourceMemoryId,
              relation: relation.relation,
            });
          }
        }

        const linkedIds = [
          ...outgoingLinks.map((link) => link.memoryId),
          ...backlinks.map((link) => link.memoryId),
        ];
        if (linkedIds.length > 0) {
          const linkedMemories = await this.reader.findByIds(linkedIds, scope.ownerId, workspaceId);
          for (const memory of linkedMemories) {
            titleById.set(memory.id, memory.title);
          }
        }

        base.outgoingLinks = outgoingLinks.map((link) => ({
          ...link,
          title: titleById.get(link.memoryId),
        }));
        base.backlinks = backlinks.map((link) => ({
          ...link,
          title: titleById.get(link.memoryId),
        }));
      }

      enriched.push(base);
    }

    return enriched;
  }
}

export function rankFulltextMode(
  memories: Memory[],
  query: string,
): Array<Memory & { relevanceScore: number }> {
  const q = query.trim().toLowerCase();
  if (!q) return memories.map((memory) => ({ ...memory, relevanceScore: 0 }));

  return memories
    .map((memory) => {
      let score = 0;
      if (memory.summary.toLowerCase().includes(q)) score += 60;
      if (memory.content.toLowerCase().includes(q)) score += 40;
      if (memory.notes.toLowerCase().includes(q)) score += 20;
      return { ...memory, relevanceScore: score };
    })
    .filter((memory) => memory.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
