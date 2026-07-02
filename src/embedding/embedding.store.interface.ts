export interface StoredEmbedding {
  id: string;
  memoryId: string;
  ownerId: string;
  modelId: string;
  dimensions: number;
  vector: number[];
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmbeddingUpsertInput {
  memoryId: string;
  ownerId: string;
  modelId: string;
  dimensions: number;
  vector: number[];
  contentHash: string;
}

export interface SimilarityMatch {
  memoryId: string;
  embeddingId: string;
  score: number;
}

export interface IEmbeddingStore {
  upsert(input: EmbeddingUpsertInput): Promise<string>;
  deleteByMemoryId(memoryId: string, ownerId: string): Promise<void>;
  findByMemoryId(
    memoryId: string,
    ownerId: string,
    modelId: string,
  ): Promise<StoredEmbedding | null>;
  searchSimilar(queryVector: number[], ownerId: string, limit: number): Promise<SimilarityMatch[]>;
}
