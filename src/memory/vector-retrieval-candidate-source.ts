import type { Memory } from '../types/memory.js';
import type { RetrievalFilters } from '../repositories/memory.repository.interface.js';
import type { IRetrievalCandidateSource } from './retrieval-candidate-source.interface.js';
import type { IEmbeddingStore } from '../embedding/embedding.store.interface.js';
import type { IEmbeddingProvider } from '../embedding/embedding.provider.interface.js';
import type { IMemoryReader } from '../repositories/memory.repository.interface.js';

/**
 * Vector-based retrieval candidate source.
 *
 * Uses embedding similarity search to find candidate memories,
 * then hydrates them with full data from the repository.
 */
export class VectorRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(
    private readonly embeddingStore: IEmbeddingStore,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly memoryReader: IMemoryReader,
  ) {}

  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    const { query, ownerId, maxCandidates } = filters;

    if (!query) {
      return [];
    }

    // Generate embedding for query text
    const embeddingResults = await this.embeddingProvider.embed([
      { memoryId: '__query__', text: query },
    ]);

    if (!embeddingResults[0]) {
      return [];
    }

    const queryVector = embeddingResults[0].vector;

    // Search for similar embeddings
    const matches = await this.embeddingStore.searchSimilar(queryVector, ownerId, maxCandidates);

    if (matches.length === 0) {
      return [];
    }

    // Hydrate memories with full data
    const memoryIds = matches.map((m) => m.memoryId);
    const memories = await this.memoryReader.findByIds(memoryIds, ownerId);

    // Create id -> memory map for O(1) lookup
    const memoryMap = new Map(memories.map((m) => [m.id, m]));

    // Build results preserving similarity ranking order
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
