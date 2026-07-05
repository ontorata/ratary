import { describe, it, expect } from 'vitest';
import { LocalEmbeddingProvider } from '../../src/embedding/local-embedding.provider.js';

describe('LocalEmbeddingProvider', () => {
  it('returns normalized vectors for offline semantic smoke', async () => {
    const provider = new LocalEmbeddingProvider();
    const [result] = await provider.embed([{ memoryId: 'm1', text: 'hybrid retrieval platform' }]);
    expect(result.vector).toHaveLength(provider.dimensions);
    const magnitude = Math.sqrt(result.vector.reduce((sum, value) => sum + value * value, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });
});
