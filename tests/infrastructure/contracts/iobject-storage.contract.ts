import { describe, it, expect } from 'vitest';
import type {
  IObjectStorage,
  ObjectStorageKey,
} from '../../../src/ports/storage/iobject-storage.port.js';

const sampleKey: ObjectStorageKey = {
  segments: ['owner-a', 'ws-1', 'mem-1', 'content'],
};

export function describeObjectStorageContract(
  label: string,
  createStorage: () => IObjectStorage | Promise<IObjectStorage>,
): void {
  describe(`IObjectStorage contract — ${label}`, () => {
    it('should round-trip put and get', async () => {
      const storage = await createStorage();
      await storage.put(sampleKey, 'hello object store', { contentType: 'text/plain' });
      const stored = await storage.get(sampleKey);
      expect(stored).not.toBeNull();
      expect(Buffer.from(stored!.body).toString('utf8')).toBe('hello object store');
    });

    it('should report exists after put', async () => {
      const storage = await createStorage();
      await storage.put(sampleKey, 'payload');
      expect(await storage.exists(sampleKey)).toBe(true);
    });

    it('should return null for missing key on get', async () => {
      const storage = await createStorage();
      expect(await storage.get({ segments: ['missing', 'key'] })).toBeNull();
    });

    it('should delete stored object', async () => {
      const storage = await createStorage();
      await storage.put(sampleKey, 'temporary');
      await storage.delete(sampleKey);
      expect(await storage.exists(sampleKey)).toBe(false);
    });
  });
}
