import { describe, it, expect } from 'vitest';
import {
  NOOP_EMBEDDING_DIMENSIONS,
  NOOP_EMBEDDING_MODEL_ID,
  NoopEmbeddingProvider,
} from '../../src/embedding/noop-embedding.provider.js';

describe('NoopEmbeddingProvider', () => {
  const provider = new NoopEmbeddingProvider();

  it('should expose noop model id and standard dimensions', () => {
    expect(provider.modelId).toBe(NOOP_EMBEDDING_MODEL_ID);
    expect(provider.dimensions).toBe(NOOP_EMBEDDING_DIMENSIONS);
    expect(provider.dimensions).toBe(1536);
  });

  it('should return empty array for empty batch', async () => {
    await expect(provider.embed([])).resolves.toEqual([]);
  });

  it('should embed a single input with zero vector', async () => {
    const results = await provider.embed([{ memoryId: 'mem-1', text: 'hello world' }]);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      memoryId: 'mem-1',
      vector: Array.from({ length: NOOP_EMBEDDING_DIMENSIONS }, () => 0),
      modelId: NOOP_EMBEDDING_MODEL_ID,
      dimensions: NOOP_EMBEDDING_DIMENSIONS,
    });
  });

  it('should embed a batch preserving memory ids', async () => {
    const results = await provider.embed([
      { memoryId: 'mem-a', text: 'first' },
      { memoryId: 'mem-b', text: 'second' },
    ]);

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.memoryId)).toEqual(['mem-a', 'mem-b']);
    for (const result of results) {
      expect(result.vector).toHaveLength(NOOP_EMBEDDING_DIMENSIONS);
      expect(result.vector.every((v) => v === 0)).toBe(true);
      expect(result.modelId).toBe(NOOP_EMBEDDING_MODEL_ID);
      expect(result.dimensions).toBe(NOOP_EMBEDDING_DIMENSIONS);
    }
  });

  it('should return independent vector arrays per result', async () => {
    const results = await provider.embed([
      { memoryId: 'mem-1', text: 'a' },
      { memoryId: 'mem-2', text: 'b' },
    ]);

    results[0]!.vector[0] = 1;
    expect(results[1]!.vector[0]).toBe(0);
  });
});
