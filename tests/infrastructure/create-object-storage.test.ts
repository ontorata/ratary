import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetEnvCache } from '../../src/config/index.js';
import { getEnv } from '../../src/config/index.js';
import { createObjectStorage } from '../../src/infrastructure/composition/create-object-storage.js';
import { InlineObjectStorage } from '../../src/infrastructure/storage/inline-object-storage.adapter.js';
import { R2ObjectStorageAdapter } from '../../src/infrastructure/storage/r2-object-storage.adapter.js';

describe('createObjectStorage', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('should return InlineObjectStorage by default', () => {
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 'inline');
    const storage = createObjectStorage(getEnv());
    expect(storage).toBeInstanceOf(InlineObjectStorage);
  });

  it('should return R2ObjectStorageAdapter when configured', () => {
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 'r2');
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('R2_BUCKET_NAME', 'ai-brain-content');
    vi.stubEnv('R2_ACCESS_KEY_ID', 'test-access-key');
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret-key');

    const storage = createObjectStorage(getEnv());
    expect(storage).toBeInstanceOf(R2ObjectStorageAdapter);
  });

  it('should return S3-backed adapter when OBJECT_STORAGE_PROVIDER=s3', () => {
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 's3');
    vi.stubEnv('S3_BUCKET_NAME', 'ai-brain-content');
    vi.stubEnv('S3_ACCESS_KEY_ID', 'test-access-key');
    vi.stubEnv('S3_SECRET_ACCESS_KEY', 'test-secret-key');
    vi.stubEnv('S3_REGION', 'us-east-1');
    vi.stubEnv('S3_ENDPOINT', 'http://127.0.0.1:9000');
    vi.stubEnv('S3_FORCE_PATH_STYLE', 'true');

    const storage = createObjectStorage(getEnv());
    expect(storage).toBeInstanceOf(R2ObjectStorageAdapter);
  });
});
