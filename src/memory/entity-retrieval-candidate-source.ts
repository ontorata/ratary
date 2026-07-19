/**
 * Phase 35 — entity retrieval candidate source, fourth RRF role (ADR-068 D5).
 *
 * Read-only: query symbols resolve against the registry (never auto-create)
 * and matching memories arrive via mention edges in deterministic order
 * (mention confidence DESC, memory id ASC). Registered in composition only
 * when ENTITY_RESOLUTION_ENABLED=true (invariant I0).
 */
import type { Memory } from '../types/memory.js';
import type {
  IMemoryReader,
  RetrievalFilters,
} from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { IEntityResolver, SymbolInput } from '../ports/entities/ientity-resolver.port.js';
import type { IEntityMentionStore } from '../ports/entities/ientity-mention-store.port.js';

export class EntityRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(
    private readonly resolver: IEntityResolver,
    private readonly mentionStore: IEntityMentionStore,
    private readonly reader: Pick<IMemoryReader, 'findByIds'>,
  ) {}

  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const symbols = extractQuerySymbols(filters);
    if (symbols.length === 0) {
      return [];
    }

    const resolutions = await this.resolver.resolve(filters.ownerId, symbols);
    const entityIds: string[] = [];
    const seenEntities = new Set<string>();
    for (const resolution of resolutions) {
      if (resolution.resolved && !seenEntities.has(resolution.entity.id)) {
        seenEntities.add(resolution.entity.id);
        entityIds.push(resolution.entity.id);
      }
    }
    if (entityIds.length === 0) {
      return [];
    }

    const mentions = await this.mentionStore.findByEntityIds(filters.ownerId, entityIds);
    const orderedMemoryIds: string[] = [];
    const seenMemories = new Set<string>();
    for (const mention of mentions) {
      if (!seenMemories.has(mention.memoryId)) {
        seenMemories.add(mention.memoryId);
        orderedMemoryIds.push(mention.memoryId);
      }
    }
    if (orderedMemoryIds.length === 0) {
      return [];
    }

    const memories = await this.reader.findByIds(
      orderedMemoryIds,
      filters.ownerId,
      filters.workspaceId,
    );
    const byId = new Map(memories.map((m) => [m.id, m]));

    // Archived filtering happens before the cap so a filtered-out row never
    // consumes a candidate slot.
    const result: Memory[] = [];
    for (const id of orderedMemoryIds) {
      const memory = byId.get(id);
      if (!memory || memory.archived) {
        continue;
      }
      result.push(memory);
      if (result.length >= filters.maxCandidates) {
        break;
      }
    }
    return result;
  }
}

/**
 * Deterministic symbol extraction from retrieval filters: explicit tag
 * filters as `tag` symbols, then the query string (whole + whitespace
 * tokens) as `keyword` symbols. Resolution itself dedupes and normalizes.
 */
export function extractQuerySymbols(
  filters: Pick<RetrievalFilters, 'query' | 'tags'>,
): SymbolInput[] {
  const symbols: SymbolInput[] = [];

  for (const tag of filters.tags ?? []) {
    symbols.push({ symbol: tag, field: 'tag' });
  }

  const query = filters.query?.trim();
  if (query) {
    symbols.push({ symbol: query, field: 'keyword' });
    const tokens = query.split(/\s+/);
    if (tokens.length > 1) {
      for (const token of tokens) {
        symbols.push({ symbol: token, field: 'keyword' });
      }
    }
  }

  return symbols;
}
