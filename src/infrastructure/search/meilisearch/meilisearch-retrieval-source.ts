import type {
  IMemoryReader,
  RetrievalFilters,
} from '../../../repositories/memory.repository.interface.js';
import type { Memory } from '../../../types/memory.js';
import type { IRetrievalCandidateSource } from '../../../memory/retrieval-candidate-source.interface.js';

export interface MeilisearchHit {
  id: string;
}

export interface MeilisearchSearchClient {
  search(
    index: string,
    query: string,
    options: { filter?: string; limit: number },
  ): Promise<{ hits: MeilisearchHit[] }>;
}

export interface MeilisearchRetrievalSourceConfig {
  index: string;
}

/**
 * Meilisearch-backed lexical retrieval source (ADR-014).
 * Hydrates hits via IMemoryReader; owner scoping enforced in Meilisearch filter.
 */
export class MeilisearchRetrievalSource implements IRetrievalCandidateSource {
  constructor(
    private readonly client: MeilisearchSearchClient,
    private readonly memoryReader: IMemoryReader,
    private readonly config: MeilisearchRetrievalSourceConfig,
  ) {}

  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const { query, ownerId, workspaceId, maxCandidates } = filters;
    if (!query) {
      return [];
    }

    const filterParts = [`owner_id = "${escapeFilterValue(ownerId)}"`];
    if (workspaceId) {
      filterParts.push(`workspace_id = "${escapeFilterValue(workspaceId)}"`);
    }
    if (filters.projectId) {
      filterParts.push(`project_id = "${escapeFilterValue(filters.projectId)}"`);
    }

    const response = await this.client.search(this.config.index, query, {
      filter: filterParts.join(' AND '),
      limit: maxCandidates,
    });

    const ids = response.hits.map((hit) => hit.id);
    if (ids.length === 0) {
      return [];
    }

    const memories = await this.memoryReader.findByIds(ids, ownerId, workspaceId);
    const memoryMap = new Map(memories.map((memory) => [memory.id, memory]));
    const ordered: Memory[] = [];
    for (const id of ids) {
      const memory = memoryMap.get(id);
      if (memory && !memory.archived) {
        ordered.push(memory);
      }
    }
    return ordered;
  }
}

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
