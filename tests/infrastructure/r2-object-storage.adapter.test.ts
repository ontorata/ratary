import { describe, it, expect, vi } from 'vitest';
import {
  R2ObjectStorageAdapter,
  type R2ObjectCommands,
} from '../../src/infrastructure/storage/r2-object-storage.adapter.js';
import { describeObjectStorageContract } from './contracts/iobject-storage.contract.js';

function createMockCommands(): R2ObjectCommands & {
  store: Map<string, { body: Uint8Array; contentType?: string }>;
} {
  const store = new Map<string, { body: Uint8Array; contentType?: string }>();
  return {
    store,
    putObject: vi.fn(async ({ key, body, contentType }) => {
      store.set(key, { body, contentType });
    }),
    getObject: vi.fn(async ({ key }) => {
      const entry = store.get(key);
      if (!entry) {
        return null;
      }
      return {
        body: entry.body,
        metadata: { contentType: entry.contentType, contentLength: entry.body.byteLength },
      };
    }),
    headObject: vi.fn(async ({ key }) => store.has(key)),
    deleteObject: vi.fn(async ({ key }) => {
      store.delete(key);
    }),
  };
}

describe('R2ObjectStorageAdapter', () => {
  it('should map object key segments to slash-separated R2 keys', async () => {
    const commands = createMockCommands();
    const adapter = new R2ObjectStorageAdapter({ bucketName: 'memories' }, commands);

    await adapter.put({ segments: ['org', 'ws', 'mem-1', 'content'] }, 'blob');

    expect(commands.putObject).toHaveBeenCalledWith({
      bucket: 'memories',
      key: 'org/ws/mem-1/content',
      body: expect.any(Uint8Array),
      contentType: undefined,
    });
  });
});

describeObjectStorageContract('R2ObjectStorageAdapter (mock commands)', () => {
  const commands = createMockCommands();
  return new R2ObjectStorageAdapter({ bucketName: 'test-bucket' }, commands);
});

describeObjectStorageContract('InlineObjectStorage', async () => {
  const { InlineObjectStorage } =
    await import('../../src/infrastructure/storage/inline-object-storage.adapter.js');
  return new InlineObjectStorage();
});
