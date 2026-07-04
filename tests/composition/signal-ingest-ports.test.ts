import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createSignalIngestPorts } from '../../src/composition/create-signal-ingest-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('createSignalIngestPorts (Phase 8.5)', () => {
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

  it('returns disabled ports by default', () => {
    vi.stubEnv('SIGNAL_INGEST_ENABLED', 'false');
    resetEnvCache();

    const ports = createSignalIngestPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.normalizer).toBeDefined();
    expect(ports.ingestor).toBeDefined();
  });

  it('wires SQL signal store when ingest enabled', () => {
    vi.stubEnv('SIGNAL_INGEST_ENABLED', 'true');
    vi.stubEnv('SIGNAL_STORE_PROVIDER', 'sql');
    resetEnvCache();

    const ports = createSignalIngestPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
  });
});
