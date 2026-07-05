import type { EmbeddingInput, EmbeddingResult, IEmbeddingProvider } from './embedding.provider.interface.js';

const DEFAULT_MODEL_ID = 'local-hash-v1';
const DEFAULT_DIMENSIONS = 64;

function hashToken(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function vectorize(text: string, dimensions: number): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

  for (const token of tokens) {
    const bucket = hashToken(token) % dimensions;
    vector[bucket] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) return vector;
  return vector.map((value) => value / magnitude);
}

/**
 * Deterministic offline embedding provider for air-gapped deploys (Phase 5.6 / 6.6E).
 * Uses hashed bag-of-words vectors — not production semantic quality, but enables vector leg smoke tests.
 */
export class LocalEmbeddingProvider implements IEmbeddingProvider {
  readonly modelId: string;
  readonly dimensions: number;

  constructor(options: { modelId?: string; dimensions?: number } = {}) {
    this.modelId = options.modelId ?? DEFAULT_MODEL_ID;
    this.dimensions = options.dimensions ?? DEFAULT_DIMENSIONS;
  }

  async embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
    return inputs.map((input) => ({
      memoryId: input.memoryId,
      modelId: this.modelId,
      dimensions: this.dimensions,
      vector: vectorize(input.text, this.dimensions),
    }));
  }
}
