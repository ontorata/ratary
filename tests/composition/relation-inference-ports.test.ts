import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRelationInferencePorts } from '../../src/composition/create-relation-inference-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('createRelationInferencePorts (Phase 8.7)', () => {
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
    vi.stubEnv('RELATION_INFERENCE_ENABLED', 'false');
    resetEnvCache();

    const ports = createRelationInferencePorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
  });

  it('wires orchestrator when inference enabled', () => {
    vi.stubEnv('RELATION_INFERENCE_ENABLED', 'true');
    vi.stubEnv('RELATION_INFERENCE_STORE_PROVIDER', 'sql');
    resetEnvCache();

    const ports = createRelationInferencePorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.orchestrator).toBeDefined();
  });
});
