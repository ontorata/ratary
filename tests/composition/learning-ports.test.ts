import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLearningPorts } from '../../src/composition/create-learning-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('createLearningPorts (Phase 8.6)', () => {
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
    vi.stubEnv('LEARNING_ENGINE_ENABLED', 'false');
    resetEnvCache();

    const ports = createLearningPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.eventRecorder).toBeUndefined();
  });

  it('wires SQL stores when learning enabled', () => {
    vi.stubEnv('LEARNING_ENGINE_ENABLED', 'true');
    vi.stubEnv('LEARNING_STORE_PROVIDER', 'sql');
    resetEnvCache();

    const ports = createLearningPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.eventStore).toBeDefined();
    expect(ports.artifactStore).toBeDefined();
    expect(ports.eventRecorder).toBeDefined();
  });
});
