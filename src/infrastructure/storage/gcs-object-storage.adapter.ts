import { Storage } from '@google-cloud/storage';
import type {
  IObjectStorage,
  ObjectStorageKey,
  StoredObject,
  StoredObjectMetadata,
} from '../../ports/storage/iobject-storage.port.js';
import { objectStorageKeyPath } from '../_shared/object-storage-key.js';

export interface GcsObjectStorageConfig {
  bucketName: string;
  keyFile?: string;
}

/**
 * Google Cloud Storage adapter implementing IObjectStorage (ADR-065 / Phase 30E).
 */
export class GcsObjectStorageAdapter implements IObjectStorage {
  private readonly bucket: ReturnType<Storage['bucket']>;

  constructor(config: GcsObjectStorageConfig) {
    const storage = new Storage(config.keyFile ? { keyFilename: config.keyFile } : undefined);
    this.bucket = storage.bucket(config.bucketName);
  }

  async put(
    key: ObjectStorageKey,
    body: Uint8Array | string,
    metadata?: StoredObjectMetadata,
  ): Promise<void> {
    const objectKey = objectStorageKeyPath(key);
    const file = this.bucket.file(objectKey);
    const bytes = typeof body === 'string' ? Buffer.from(body, 'utf8') : Buffer.from(body);
    await file.save(bytes, {
      contentType: metadata?.contentType,
      resumable: false,
    });
  }

  async get(key: ObjectStorageKey): Promise<StoredObject | null> {
    const objectKey = objectStorageKeyPath(key);
    const file = this.bucket.file(objectKey);
    try {
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }
      const [buffer] = await file.download();
      const [meta] = await file.getMetadata();
      return {
        body: new Uint8Array(buffer),
        metadata: {
          contentType: meta.contentType,
          contentLength: meta.size ? Number(meta.size) : undefined,
          etag: meta.etag,
        },
      };
    } catch (error) {
      if (isGcsNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(key: ObjectStorageKey): Promise<void> {
    const objectKey = objectStorageKeyPath(key);
    await this.bucket.file(objectKey).delete({ ignoreNotFound: true });
  }

  async exists(key: ObjectStorageKey): Promise<boolean> {
    const objectKey = objectStorageKeyPath(key);
    const [exists] = await this.bucket.file(objectKey).exists();
    return exists;
  }
}

export function createGcsObjectStorage(config: GcsObjectStorageConfig): GcsObjectStorageAdapter {
  return new GcsObjectStorageAdapter(config);
}

function isGcsNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const code = 'code' in error ? Number((error as { code?: number }).code) : undefined;
  return code === 404;
}
