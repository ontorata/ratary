import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { createPlatformAdapters } from '../../src/infrastructure/composition/create-platform-adapters.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';

class MinimalD1Client implements D1Client {
  async query<T = Record<string, unknown>>(): Promise<T[]> {
    return [] as T[];
  }

  async execute(): Promise<D1QueryResult> {
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('createPlatformAdapters defaults', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('should wire D1 sql, vector bridge, and allow-all membership at defaults', () => {
    vi.stubEnv('SQL_PROVIDER', 'd1');
    vi.stubEnv('VECTOR_PROVIDER', 'd1');
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 'inline');
    vi.stubEnv('CACHE_PROVIDER', 'none');
    vi.stubEnv('ENTERPRISE_RBAC', 'false');

    const platform = createPlatformAdapters(new MinimalD1Client(), getEnv());

    expect(platform.sql).toBeDefined();
    expect(platform.embeddingStore).toBeDefined();
    expect(platform.vectorStore).toBeDefined();
    expect(platform.objectStorage).toBeDefined();
    expect(platform.cache).toBeDefined();
    expect(platform.eventBus).toBeDefined();
    expect(platform.analyticsStore).toBeDefined();
    expect(platform.organizationStore).toBeDefined();
  });

  it('should use D1 workspace membership when ENTERPRISE_RBAC is true', () => {
    vi.stubEnv('ENTERPRISE_RBAC', 'true');

    const platform = createPlatformAdapters(new MinimalD1Client(), getEnv());
    expect(platform.workspaceMembership.constructor.name).toBe('D1WorkspaceMembership');
  });

  it('should wire R2ObjectStorageAdapter when OBJECT_STORAGE_PROVIDER=r2', () => {
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 'r2');
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('R2_BUCKET_NAME', 'ai-brain-content');
    vi.stubEnv('R2_ACCESS_KEY_ID', 'test-access-key');
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret-key');

    const platform = createPlatformAdapters(new MinimalD1Client(), getEnv());
    expect(platform.objectStorage.constructor.name).toBe('R2ObjectStorageAdapter');
  });

  it('should wire PostgresSqlDatabaseAdapter when SQL_PROVIDER=postgres', () => {
    vi.stubEnv('SQL_PROVIDER', 'postgres');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/ratary_test');

    const platform = createPlatformAdapters(new MinimalD1Client(), getEnv());
    expect(platform.sql.constructor.name).toBe('PostgresSqlDatabaseAdapter');
  });
});
