import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createInspectionLedgerPorts } from '../../src/composition/create-inspection-ledger-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('createInspectionLedgerPorts (Phase 8.8)', () => {
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
    vi.stubEnv('INSPECTION_LEDGER_ENABLED', 'false');
    resetEnvCache();
    const ports = createInspectionLedgerPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
  });

  it('wires orchestrator when ledger + learning enabled', () => {
    vi.stubEnv('INSPECTION_LEDGER_ENABLED', 'true');
    vi.stubEnv('INSPECTION_LEDGER_STORE_PROVIDER', 'sql');
    vi.stubEnv('LEARNING_ENGINE_ENABLED', 'true');
    vi.stubEnv('LEARNING_STORE_PROVIDER', 'sql');
    resetEnvCache();
    const ports = createInspectionLedgerPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.patternStore).toBeDefined();
  });
});
