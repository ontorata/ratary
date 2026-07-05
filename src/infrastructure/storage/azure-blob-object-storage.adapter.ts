import { BlobServiceClient } from '@azure/storage-blob';
import type {
  IObjectStorage,
  ObjectStorageKey,
  StoredObject,
  StoredObjectMetadata,
} from '../../ports/storage/iobject-storage.port.js';
import { objectStorageKeyPath } from '../_shared/object-storage-key.js';

export interface AzureBlobObjectStorageConfig {
  connectionString: string;
  containerName: string;
}

/**
 * Azure Blob Storage adapter implementing IObjectStorage (ADR-065 / Phase 30E).
 */
export class AzureBlobObjectStorageAdapter implements IObjectStorage {
  private readonly containerClient: ReturnType<BlobServiceClient['getContainerClient']>;

  constructor(config: AzureBlobObjectStorageConfig) {
    const service = BlobServiceClient.fromConnectionString(config.connectionString);
    this.containerClient = service.getContainerClient(config.containerName);
  }

  async put(
    key: ObjectStorageKey,
    body: Uint8Array | string,
    metadata?: StoredObjectMetadata,
  ): Promise<void> {
    const blob = this.containerClient.getBlockBlobClient(objectStorageKeyPath(key));
    const bytes = typeof body === 'string' ? Buffer.from(body, 'utf8') : Buffer.from(body);
    await blob.upload(bytes, bytes.length, {
      blobHTTPHeaders: metadata?.contentType
        ? { blobContentType: metadata.contentType }
        : undefined,
    });
  }

  async get(key: ObjectStorageKey): Promise<StoredObject | null> {
    const blob = this.containerClient.getBlockBlobClient(objectStorageKeyPath(key));
    try {
      const download = await blob.download();
      const buffer = await streamToBuffer(download.readableStreamBody);
      if (!buffer) {
        return null;
      }
      return {
        body: new Uint8Array(buffer),
        metadata: {
          contentType: download.contentType,
          contentLength: download.contentLength,
          etag: download.etag,
        },
      };
    } catch (error) {
      if (isAzureNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(key: ObjectStorageKey): Promise<void> {
    const blob = this.containerClient.getBlockBlobClient(objectStorageKeyPath(key));
    await blob.deleteIfExists();
  }

  async exists(key: ObjectStorageKey): Promise<boolean> {
    const blob = this.containerClient.getBlockBlobClient(objectStorageKeyPath(key));
    return blob.exists();
  }
}

export function createAzureBlobObjectStorage(
  config: AzureBlobObjectStorageConfig,
): AzureBlobObjectStorageAdapter {
  return new AzureBlobObjectStorageAdapter(config);
}

async function streamToBuffer(
  stream: NodeJS.ReadableStream | undefined,
): Promise<Buffer | null> {
  if (!stream) {
    return null;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function isAzureNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const statusCode =
    'statusCode' in error ? (error as { statusCode?: number }).statusCode : undefined;
  return statusCode === 404;
}
