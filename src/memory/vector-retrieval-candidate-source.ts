import type { Memory } from '../types/memory.js';
import type { RetrievalFilters } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { IVectorStore } from '../ports/vector/ivector-store.port.js';
import type { IEmbeddingProvider } from '../embedding/embedding.provider.interface.js';
import type { IMemoryReader } from '../repositories/memory.repository.interface.js';

/**
 * Vector-based retrieval candidate source.
 *
 * Uses IVectorStore similarity search to find candidate memories,
 * then hydrates them with full data from the repository.
 */
export class VectorRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(
    private readonly vectorStore: IVectorStore,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly memoryReader: IMemoryReader,
  ) {}

  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const { query, ownerId, maxCandidates } = filters;

    if (!query) {
      return [];
    }

    const embeddingResults = await this.embeddingProvider.embed([
      { memoryId: '__query__', text: query, ownerId, workspaceId: filters.workspaceId },
    ]);

    if (!embeddingResults[0]) {
      return [];
    }

    const queryVector = embeddingResults[0].vector;

    const matches = await this.vectorStore.searchSimilar(
      queryVector,
      { ownerId, workspaceId: filters.workspaceId },
      maxCandidates,
    );

    if (matches.length === 0) {
      return [];
    }

    const memoryIds = matches.map((m) => m.memoryId);
    const memories = await this.memoryReader.findByIds(memoryIds, ownerId, filters.workspaceId);

    const memoryMap = new Map(memories.map((m) => [m.id, m]));

    const results: Memory[] = [];
    for (const match of matches) {
      const memory = memoryMap.get(match.memoryId);
      if (memory) {
        results.push(memory);
      }
    }

    return results;
  }
}
