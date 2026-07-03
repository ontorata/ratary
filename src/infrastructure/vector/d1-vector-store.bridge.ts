import type { IEmbeddingStore } from '../../embedding/embedding.store.interface.js';
import type {
  IVectorStore,
  StoredVector,
  VectorScopeKey,
  VectorSearchMatch,
  VectorUpsertInput,
} from '../../ports/vector/ivector-store.port.js';

/** Maps legacy owner-scoped IEmbeddingStore to canonical IVectorStore. */
export class D1VectorStoreBridge implements IVectorStore {
  constructor(private readonly store: IEmbeddingStore) {}

  async upsert(input: VectorUpsertInput): Promise<string> {
    return this.store.upsert({
      memoryId: input.memoryId,
      ownerId: input.scope.ownerId,
      modelId: input.modelId,
      dimensions: input.dimensions,
      vector: [...input.vector],
      contentHash: input.contentHash,
    });
  }

  async deleteByMemoryId(memoryId: string, scope: VectorScopeKey): Promise<void> {
    await this.store.deleteByMemoryId(memoryId, scope.ownerId);
  }

  async deleteAllInScope(scope: VectorScopeKey): Promise<void> {
    await this.store.deleteAllByOwner(scope.ownerId);
  }

  async findByMemoryId(
    memoryId: string,
    scope: VectorScopeKey,
    modelId: string,
  ): Promise<StoredVector | null> {
    const row = await this.store.findByMemoryId(memoryId, scope.ownerId, modelId);
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      memoryId: row.memoryId,
      scope,
      modelId: row.modelId,
      dimensions: row.dimensions,
      vector: row.vector,
      contentHash: row.contentHash,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async searchSimilar(
    queryVector: readonly number[],
    scope: VectorScopeKey,
    limit: number,
  ): Promise<VectorSearchMatch[]> {
    const matches = await this.store.searchSimilar([...queryVector], scope.ownerId, limit);
    return matches.map((match) => ({
      memoryId: match.memoryId,
      vectorId: match.embeddingId,
      score: match.score,
    }));
  }
}
