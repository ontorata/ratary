import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuditRepository } from '../../src/auth/audit.repository.js';
import { createMultiClientSyncPorts } from '../../src/composition/create-multi-client-sync-ports.js';
import { ConflictAwareSyncManager } from '../../src/client-sync/conflict-aware-sync-manager.js';
import { AcceptSyncManager } from '../../src/sync/accept-sync-manager.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('createMultiClientSyncPorts (Phase 09.8)', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns AcceptSyncManager by default', () => {
    vi.stubEnv('MULTI_CLIENT_SYNC_ENABLED', 'false');
    resetEnvCache();

    const sql = asSqlDatabase(new MockD1Client());
    const ports = createMultiClientSyncPorts(sql, getEnv(), new AuditRepository(sql));
    expect(ports.enabled).toBe(false);
    expect(ports.syncManager).toBeInstanceOf(AcceptSyncManager);
  });

  it('wires ConflictAwareSyncManager when enabled', () => {
    vi.stubEnv('MULTI_CLIENT_SYNC_ENABLED', 'true');
    vi.stubEnv('MULTI_CLIENT_SYNC_STORE_PROVIDER', 'sql');
    vi.stubEnv('MULTI_CLIENT_SYNC_STRATEGY', 'lww');
    resetEnvCache();

    const sql = asSqlDatabase(new MockD1Client());
    const ports = createMultiClientSyncPorts(sql, getEnv(), new AuditRepository(sql));
    expect(ports.enabled).toBe(true);
    expect(ports.syncManager).toBeInstanceOf(ConflictAwareSyncManager);
    expect(ports.strategy).toBe('lww');
  });
});
