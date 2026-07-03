/**
 * Vendor-neutral object/blob storage port.
 * Adapters: R2, MinIO, S3, Azure Blob, GCS, local FS.
 * @see docs/adr/005-content-object-store.md
 * @see docs/adr/008-platform-architecture.md
 */
export interface ObjectStorageKey {
  /** Logical key segments — adapter maps to bucket/path convention. */
  segments: readonly string[];
}

export interface StoredObjectMetadata {
  contentType?: string;
  contentLength?: number;
  etag?: string;
}

export interface StoredObject {
  body: Uint8Array;
  metadata?: StoredObjectMetadata;
}

export interface IObjectStorage {
  put(
    key: ObjectStorageKey,
    body: Uint8Array | string,
    metadata?: StoredObjectMetadata,
  ): Promise<void>;
  get(key: ObjectStorageKey): Promise<StoredObject | null>;
  delete(key: ObjectStorageKey): Promise<void>;
  exists(key: ObjectStorageKey): Promise<boolean>;
}
