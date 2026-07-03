import { describe, it, expect, vi } from 'vitest';
import { D1VectorStoreBridge } from '../../src/infrastructure/vector/d1-vector-store.bridge.js';
import type { IEmbeddingStore } from '../../src/embedding/embedding.store.interface.js';

function createMockEmbeddingStore(): IEmbeddingStore {
  return {
    upsert: vi.fn(async () => 'emb-1'),
    deleteByMemoryId: vi.fn(async () => undefined),
    deleteAllByOwner: vi.fn(async () => undefined),
    findByMemoryId: vi.fn(async () => ({
      id: 'emb-1',
      memoryId: 'mem-1',
      ownerId: 'owner-a',
      modelId: 'noop',
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'hash',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })),
    searchSimilar: vi.fn(async () => [
      { memoryId: 'mem-2', embeddingId: 'emb-2', score: 0.9 },
    ]),
  };
}

describe('D1VectorStoreBridge', () => {
  it('should map scope ownerId to embedding store upsert', async () => {
    const store = createMockEmbeddingStore();
    const bridge = new D1VectorStoreBridge(store);

    const id = await bridge.upsert({
      memoryId: 'mem-1',
      scope: { ownerId: 'owner-a', workspaceId: 'ws-1' },
      modelId: 'noop',
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'hash',
    });

    expect(id).toBe('emb-1');
    expect(store.upsert).toHaveBeenCalledWith({
      memoryId: 'mem-1',
      ownerId: 'owner-a',
      modelId: 'noop',
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'hash',
    });
  });

  it('should map searchSimilar results to vector port shape', async () => {
    const store = createMockEmbeddingStore();
    const bridge = new D1VectorStoreBridge(store);

    const matches = await bridge.searchSimilar([1, 0, 0], { ownerId: 'owner-a' }, 5);
    expect(matches).toEqual([{ memoryId: 'mem-2', vectorId: 'emb-2', score: 0.9 }]);
    expect(store.searchSimilar).toHaveBeenCalledWith([1, 0, 0], 'owner-a', 5);
  });

  it('should delete by memory using owner scope', async () => {
    const store = createMockEmbeddingStore();
    const bridge = new D1VectorStoreBridge(store);

    await bridge.deleteByMemoryId('mem-1', { ownerId: 'owner-a' });
    expect(store.deleteByMemoryId).toHaveBeenCalledWith('mem-1', 'owner-a');
  });
});
