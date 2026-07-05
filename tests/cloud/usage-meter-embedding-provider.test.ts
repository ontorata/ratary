import { describe, it, expect } from 'vitest';
import { UsageMeterEmbeddingProvider } from '../../src/cloud/adapters/usage-meter-embedding-provider.js';
import { InMemoryUsageMeter } from '../../src/cloud/adapters/in-memory-usage-meter.js';
import type {
  EmbeddingInput,
  EmbeddingResult,
  IEmbeddingProvider,
} from '../../src/embedding/embedding.provider.interface.js';

class StubEmbeddingProvider implements IEmbeddingProvider {
  readonly modelId = 'stub';
  readonly dimensions = 4;

  async embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
    return inputs.map((input) => ({
      memoryId: input.memoryId,
      modelId: this.modelId,
      dimensions: this.dimensions,
      vector: [0.1, 0.2, 0.3, 0.4],
    }));
  }
}

describe('UsageMeterEmbeddingProvider', () => {
  it('records embedding.request for inputs with ownerId', async () => {
    const meter = new InMemoryUsageMeter();
    const provider = new UsageMeterEmbeddingProvider(new StubEmbeddingProvider(), meter);

    await provider.embed([
      { memoryId: 'm1', text: 'hello', ownerId: 'owner-1', workspaceId: 'ws-1' },
      { memoryId: 'm2', text: 'world' },
    ]);

    const exported = await meter.export({});
    expect(exported.records).toHaveLength(1);
    expect(exported.records[0]?.metricType).toBe('embedding.request');
    expect(exported.records[0]?.ownerId).toBe('owner-1');
  });
});
