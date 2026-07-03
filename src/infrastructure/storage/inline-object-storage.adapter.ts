import type {
  IObjectStorage,
  ObjectStorageKey,
  StoredObject,
  StoredObjectMetadata,
} from '../../ports/storage/iobject-storage.port.js';
import { objectStorageKeyPath } from '../_shared/object-storage-key.js';

/** Dev/default adapter — stores blobs in memory (not durable across restarts). */
export class InlineObjectStorage implements IObjectStorage {
  private readonly blobs = new Map<string, StoredObject>();

  async put(
    key: ObjectStorageKey,
    body: Uint8Array | string,
    metadata?: StoredObjectMetadata,
  ): Promise<void> {
    const bytes = typeof body === 'string' ? Buffer.from(body, 'utf8') : body;
    this.blobs.set(objectStorageKeyPath(key), { body: bytes, metadata });
  }

  async get(key: ObjectStorageKey): Promise<StoredObject | null> {
    return this.blobs.get(objectStorageKeyPath(key)) ?? null;
  }

  async delete(key: ObjectStorageKey): Promise<void> {
    this.blobs.delete(objectStorageKeyPath(key));
  }

  async exists(key: ObjectStorageKey): Promise<boolean> {
    return this.blobs.has(objectStorageKeyPath(key));
  }
}
