import { describe, it, expect, beforeEach } from 'vitest';
import { D1EmbeddingStore } from '../../src/embedding/d1-embedding.store.js';
import { NOOP_EMBEDDING_MODEL_ID } from '../../src/embedding/noop-embedding.provider.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';

describe('D1EmbeddingStore', () => {
  let store: D1EmbeddingStore;
  let mockDb: MockD1Client;

  const ownerId = 'owner-embed-store';
  const modelId = NOOP_EMBEDDING_MODEL_ID;
  const contentHash = 'abc123';

  beforeEach(() => {
    mockDb = new MockD1Client();
    store = new D1EmbeddingStore(asSqlDatabase(mockDb));
  });

  it('should insert and find embedding by memory and model', async () => {
    const embeddingId = await store.upsert({
      memoryId: 'mem-1',
      ownerId,
      modelId,
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash,
    });

    const stored = await store.findByMemoryId('mem-1', ownerId, modelId);

    expect(stored?.id).toBe(embeddingId);
    expect(stored?.vector).toEqual([1, 0, 0]);
    expect(stored?.contentHash).toBe(contentHash);
  });

  it('should update existing embedding on upsert for same memory and model', async () => {
    const firstId = await store.upsert({
      memoryId: 'mem-2',
      ownerId,
      modelId,
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'hash-a',
    });

    const secondId = await store.upsert({
      memoryId: 'mem-2',
      ownerId,
      modelId,
      dimensions: 3,
      vector: [0, 1, 0],
      contentHash: 'hash-b',
    });

    expect(secondId).toBe(firstId);

    const stored = await store.findByMemoryId('mem-2', ownerId, modelId);
    expect(stored?.vector).toEqual([0, 1, 0]);
    expect(stored?.contentHash).toBe('hash-b');
  });

  it('should not find embedding for wrong owner', async () => {
    await store.upsert({
      memoryId: 'mem-3',
      ownerId,
      modelId,
      dimensions: 2,
      vector: [1, 0],
      contentHash,
    });

    const stored = await store.findByMemoryId('mem-3', 'other-owner', modelId);
    expect(stored).toBeNull();
  });

  it('should delete embeddings scoped to owner and memory', async () => {
    await store.upsert({
      memoryId: 'mem-4',
      ownerId,
      modelId,
      dimensions: 2,
      vector: [1, 0],
      contentHash,
    });

    await store.deleteByMemoryId('mem-4', ownerId);

    expect(await store.findByMemoryId('mem-4', ownerId, modelId)).toBeNull();
  });

  it('should delete all embeddings for owner', async () => {
    await store.upsert({
      memoryId: 'mem-5a',
      ownerId,
      modelId,
      dimensions: 2,
      vector: [1, 0],
      contentHash: 'a',
    });
    await store.upsert({
      memoryId: 'mem-5b',
      ownerId,
      modelId,
      dimensions: 2,
      vector: [0, 1],
      contentHash: 'b',
    });
    await store.upsert({
      memoryId: 'mem-other',
      ownerId: 'other-owner',
      modelId,
      dimensions: 2,
      vector: [1, 1],
      contentHash: 'c',
    });

    await store.deleteAllByOwner(ownerId);

    expect(await store.findByMemoryId('mem-5a', ownerId, modelId)).toBeNull();
    expect(await store.findByMemoryId('mem-5b', ownerId, modelId)).toBeNull();
    expect(await store.findByMemoryId('mem-other', 'other-owner', modelId)).not.toBeNull();
  });

  it('should rank similar vectors for owner only', async () => {
    await store.upsert({
      memoryId: 'mem-a',
      ownerId,
      modelId,
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'a',
    });
    await store.upsert({
      memoryId: 'mem-b',
      ownerId,
      modelId,
      dimensions: 3,
      vector: [0.9, 0.1, 0],
      contentHash: 'b',
    });
    await store.upsert({
      memoryId: 'mem-c',
      ownerId,
      modelId,
      dimensions: 3,
      vector: [0, 1, 0],
      contentHash: 'c',
    });
    await store.upsert({
      memoryId: 'mem-other',
      ownerId: 'other-owner',
      modelId,
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'd',
    });

    const matches = await store.searchSimilar([1, 0, 0], ownerId, 2);

    expect(matches).toHaveLength(2);
    expect(matches[0]?.memoryId).toBe('mem-a');
    expect(matches[0]?.score).toBeCloseTo(1, 5);
    expect(matches[1]?.memoryId).toBe('mem-b');
    expect(matches.map((m) => m.memoryId)).not.toContain('mem-other');
  });

  it('should reject upsert when vector length mismatches dimensions', async () => {
    await expect(
      store.upsert({
        memoryId: 'mem-bad',
        ownerId,
        modelId,
        dimensions: 3,
        vector: [1, 0],
        contentHash,
      }),
    ).rejects.toThrow(/does not match dimensions/i);
  });
});
