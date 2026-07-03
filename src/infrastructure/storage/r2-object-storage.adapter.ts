import type {
  IObjectStorage,
  ObjectStorageKey,
  StoredObject,
  StoredObjectMetadata,
} from '../../ports/storage/iobject-storage.port.js';
import { objectStorageKeyPath } from '../_shared/object-storage-key.js';
import { createS3ObjectCommands } from '../_shared/s3-object-storage.commands.js';

/** Minimal S3/R2 command surface for test doubles (ADR-005). */
export interface R2ObjectCommands {
  putObject(input: {
    bucket: string;
    key: string;
    body: Uint8Array;
    contentType?: string;
  }): Promise<void>;
  getObject(input: { bucket: string; key: string }): Promise<StoredObject | null>;
  headObject(input: { bucket: string; key: string }): Promise<boolean>;
  deleteObject(input: { bucket: string; key: string }): Promise<void>;
}

export interface R2ObjectStorageConfig {
  bucketName: string;
}

/**
 * Cloudflare R2 adapter implementing IObjectStorage (ADR-005 / ADR-008).
 * Uses S3-compatible API via @aws-sdk/client-s3.
 */
export class R2ObjectStorageAdapter implements IObjectStorage {
  constructor(
    private readonly config: R2ObjectStorageConfig,
    private readonly commands: R2ObjectCommands,
  ) {}

  async put(
    key: ObjectStorageKey,
    body: Uint8Array | string,
    metadata?: StoredObjectMetadata,
  ): Promise<void> {
    const bytes = typeof body === 'string' ? Buffer.from(body, 'utf8') : body;
    await this.commands.putObject({
      bucket: this.config.bucketName,
      key: objectStorageKeyPath(key),
      body: bytes,
      contentType: metadata?.contentType,
    });
  }

  async get(key: ObjectStorageKey): Promise<StoredObject | null> {
    return this.commands.getObject({
      bucket: this.config.bucketName,
      key: objectStorageKeyPath(key),
    });
  }

  async delete(key: ObjectStorageKey): Promise<void> {
    await this.commands.deleteObject({
      bucket: this.config.bucketName,
      key: objectStorageKeyPath(key),
    });
  }

  async exists(key: ObjectStorageKey): Promise<boolean> {
    return this.commands.headObject({
      bucket: this.config.bucketName,
      key: objectStorageKeyPath(key),
    });
  }
}

export interface CreateR2ObjectStorageInput {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export function createR2ObjectStorage(input: CreateR2ObjectStorageInput): R2ObjectStorageAdapter {
  const commands = createAwsR2Commands(input);
  return new R2ObjectStorageAdapter({ bucketName: input.bucketName }, commands);
}

function createAwsR2Commands(input: CreateR2ObjectStorageInput): R2ObjectCommands {
  return createS3ObjectCommands({
    bucketName: input.bucketName,
    region: 'auto',
    accessKeyId: input.accessKeyId,
    secretAccessKey: input.secretAccessKey,
    endpoint: `https://${input.accountId}.r2.cloudflarestorage.com`,
  });
}
