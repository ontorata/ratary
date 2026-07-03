/**
 * Vendor-neutral vector similarity storage port.
 * Adapters: D1 in-process (MVP), Pinecone, Qdrant, Weaviate, Milvus, pgvector, Chroma.
 * @see docs/adr/008-platform-architecture.md
 */
export interface VectorScopeKey {
  ownerId: string;
  workspaceId?: string;
}

export interface StoredVector {
  id: string;
  memoryId: string;
  scope: VectorScopeKey;
  modelId: string;
  dimensions: number;
  vector: readonly number[];
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface VectorUpsertInput {
  memoryId: string;
  scope: VectorScopeKey;
  modelId: string;
  dimensions: number;
  vector: readonly number[];
  contentHash: string;
}

export interface VectorSearchMatch {
  memoryId: string;
  vectorId: string;
  score: number;
}

export interface IVectorStore {
  upsert(input: VectorUpsertInput): Promise<string>;
  deleteByMemoryId(memoryId: string, scope: VectorScopeKey): Promise<void>;
  deleteAllInScope(scope: VectorScopeKey): Promise<void>;
  findByMemoryId(
    memoryId: string,
    scope: VectorScopeKey,
    modelId: string,
  ): Promise<StoredVector | null>;
  searchSimilar(
    queryVector: readonly number[],
    scope: VectorScopeKey,
    limit: number,
  ): Promise<VectorSearchMatch[]>;
}
