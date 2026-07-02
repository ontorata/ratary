import type {
  EmbeddingInput,
  EmbeddingResult,
  IEmbeddingProvider,
} from './embedding.provider.interface.js';

/** Aligns with OpenAI text-embedding-3-small so store dimensions stay consistent when swapping providers. */
export const NOOP_EMBEDDING_DIMENSIONS = 1536;

export const NOOP_EMBEDDING_MODEL_ID = 'noop';

export class NoopEmbeddingProvider implements IEmbeddingProvider {
  readonly modelId = NOOP_EMBEDDING_MODEL_ID;
  readonly dimensions = NOOP_EMBEDDING_DIMENSIONS;

  async embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
    if (inputs.length === 0) {
      return [];
    }

    const vector = Array.from({ length: this.dimensions }, () => 0);

    return inputs.map((input) => ({
      memoryId: input.memoryId,
      vector: [...vector],
      modelId: this.modelId,
      dimensions: this.dimensions,
    }));
  }
}
