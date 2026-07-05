export interface EmbeddingInput {
  memoryId: string;
  text: string;
  /** Owner scope for usage metering (Phase 18 / D19-01). */
  ownerId?: string;
  workspaceId?: string;
}

export interface EmbeddingResult {
  memoryId: string;
  vector: number[];
  modelId: string;
  dimensions: number;
}

export interface IEmbeddingProvider {
  readonly modelId: string;
  readonly dimensions: number;
  embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]>;
}
