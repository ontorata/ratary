import type {
  IMemoryReader,
  RetrievalFilters,
} from '../../../repositories/memory.repository.interface.js';
import type { Memory } from '../../../types/memory.js';
import type { IRetrievalCandidateSource } from '../../../memory/retrieval-candidate-source.interface.js';

export interface OpenSearchHit {
  id: string;
}

export interface OpenSearchSearchClient {
  search(
    index: string,
    query: string,
    options: { ownerId: string; workspaceId?: string; projectId?: string; limit: number },
  ): Promise<{ hits: OpenSearchHit[] }>;
}

export interface OpenSearchRetrievalSourceConfig {
  index: string;
}

/**
 * OpenSearch-backed lexical retrieval source (ADR-065 / Phase 30D).
 * Hydrates hits via IMemoryReader; owner scoping enforced in OpenSearch filters.
 */
export class OpenSearchRetrievalSource implements IRetrievalCandidateSource {
  constructor(
    private readonly client: OpenSearchSearchClient,
    private readonly memoryReader: IMemoryReader,
    private readonly config: OpenSearchRetrievalSourceConfig,
  ) {}

  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const { query, ownerId, workspaceId, maxCandidates } = filters;
    if (!query) {
      return [];
    }

    const response = await this.client.search(this.config.index, query, {
      ownerId,
      workspaceId,
      projectId: filters.projectId,
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
