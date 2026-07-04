import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMemoryEvolutionPorts } from '../../src/composition/create-memory-evolution-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('createMemoryEvolutionPorts (Phase 09.7)', () => {
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
    vi.stubEnv('MEMORY_EVOLUTION_ENABLED', 'false');
    resetEnvCache();

    const ports = createMemoryEvolutionPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.service).toBeUndefined();
  });

  it('wires evolution service when enabled', () => {
    vi.stubEnv('MEMORY_EVOLUTION_ENABLED', 'true');
    vi.stubEnv('MEMORY_EVOLUTION_STORE_PROVIDER', 'sql');
    resetEnvCache();

    const ports = createMemoryEvolutionPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.coordinator.enabled).toBe(true);
    expect(ports.service).toBeDefined();
  });
});
