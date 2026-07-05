import { describe, expect, it } from 'vitest';
import type {
  IVectorStore,
  VectorScopeKey,
  VectorUpsertInput,
} from '../../src/ports/vector/ivector-store.port.js';

const scopeA: VectorScopeKey = { ownerId: 'owner-a' };
const scopeB: VectorScopeKey = { ownerId: 'owner-b' };

const sampleVector: VectorUpsertInput = {
  memoryId: 'mem-1',
  scope: scopeA,
  modelId: 'noop',
  dimensions: 3,
  vector: [1, 0, 0],
  contentHash: 'hash-a',
};

export function describeVectorStoreContract(label: string, createStore: () => IVectorStore): void {
  describe(`IVectorStore contract (${label})`, () => {
    it('should upsert and find by memory id within scope', async () => {
      const store = createStore();
      const id = await store.upsert(sampleVector);
      expect(id).toBeTruthy();

      const found = await store.findByMemoryId('mem-1', scopeA, 'noop');
      expect(found).not.toBeNull();
      expect(found!.memoryId).toBe('mem-1');
      expect(found!.scope.ownerId).toBe('owner-a');
      expect(found!.vector).toEqual([1, 0, 0]);
    });

    it('should not find memory in another owner scope', async () => {
      const store = createStore();
      await store.upsert(sampleVector);

      const found = await store.findByMemoryId('mem-1', scopeB, 'noop');
      expect(found).toBeNull();
    });

    it('should update existing vector on upsert', async () => {
      const store = createStore();
      const firstId = await store.upsert(sampleVector);
      const secondId = await store.upsert({
        ...sampleVector,
        vector: [0, 1, 0],
        contentHash: 'hash-b',
      });

      expect(secondId).toBe(firstId);
      const found = await store.findByMemoryId('mem-1', scopeA, 'noop');
      expect(found!.vector).toEqual([0, 1, 0]);
      expect(found!.contentHash).toBe('hash-b');
    });

    it('should delete by memory id within scope only', async () => {
      const store = createStore();
      await store.upsert(sampleVector);
      await store.upsert({ ...sampleVector, memoryId: 'mem-2', vector: [0, 0, 1] });

      await store.deleteByMemoryId('mem-1', scopeA);

      expect(await store.findByMemoryId('mem-1', scopeA, 'noop')).toBeNull();
      expect(await store.findByMemoryId('mem-2', scopeA, 'noop')).not.toBeNull();
    });

    it('should delete all vectors in scope', async () => {
      const store = createStore();
      await store.upsert(sampleVector);
      await store.upsert({ ...sampleVector, memoryId: 'mem-2' });
      await store.upsert({ ...sampleVector, memoryId: 'mem-3', scope: scopeB });

      await store.deleteAllInScope(scopeA);

      expect(await store.findByMemoryId('mem-1', scopeA, 'noop')).toBeNull();
      expect(await store.findByMemoryId('mem-2', scopeA, 'noop')).toBeNull();
      expect(await store.findByMemoryId('mem-3', scopeB, 'noop')).not.toBeNull();
    });

    it('should return empty search for non-positive limit', async () => {
      const store = createStore();
      await store.upsert(sampleVector);
      expect(await store.searchSimilar([1, 0, 0], scopeA, 0)).toEqual([]);
    });

    it('should rank similar vectors by score', async () => {
      const store = createStore();
      await store.upsert(sampleVector);
      await store.upsert({
        ...sampleVector,
        memoryId: 'mem-close',
        vector: [0.99, 0.01, 0],
        contentHash: 'hash-close',
      });
      await store.upsert({
        ...sampleVector,
        memoryId: 'mem-far',
        vector: [0, 0, 1],
        contentHash: 'hash-far',
      });

      const matches = await store.searchSimilar([1, 0, 0], scopeA, 2);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]!.memoryId).toBe('mem-1');
      expect(matches[0]!.score).toBeGreaterThan(matches[matches.length - 1]!.score);
    });
  });
}
