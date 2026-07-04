import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEventPipelinePorts } from '../../src/composition/create-event-pipeline-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { NoOpAnalyticsStore } from '../../src/infrastructure/analytics/noop-analytics-store.adapter.js';

describe('createEventPipelinePorts (Phase 12)', () => {
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
    vi.stubEnv('EVENT_CONSUMERS_ENABLED', 'false');
    resetEnvCache();

    const ports = createEventPipelinePorts(
      getEnv(),
      { publish: async () => {}, subscribe: async () => ({ unsubscribe: async () => {} }) },
      new NoOpAnalyticsStore(),
    );

    expect(ports.enabled).toBe(false);
    expect(ports.runner).toBeNull();
    expect(ports.coordinator.enabled).toBe(false);
  });

  it('wires coordinator and runner when enabled with redis bus', () => {
    vi.stubEnv('EVENT_CONSUMERS_ENABLED', 'true');
    vi.stubEnv('EVENT_BUS_PROVIDER', 'redis');
    vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:6379');
    vi.stubEnv('ANALYTICS_PROVIDER', 'duckdb');
    resetEnvCache();

    const ports = createEventPipelinePorts(
      getEnv(),
      { publish: async () => {}, subscribe: async () => ({ unsubscribe: async () => {} }) },
      new NoOpAnalyticsStore(),
    );

    expect(ports.enabled).toBe(true);
    expect(ports.coordinator.enabled).toBe(true);
    expect(ports.runner).not.toBeNull();
  });

  it('wraps memory access auditor when enabled', async () => {
    vi.stubEnv('EVENT_CONSUMERS_ENABLED', 'true');
    vi.stubEnv('EVENT_BUS_PROVIDER', 'redis');
    vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:6379');
    resetEnvCache();

    const published: string[] = [];
    const bus = {
      publish: async (topic: string) => {
        published.push(topic);
      },
      subscribe: async () => ({ unsubscribe: async () => {} }),
    };

    const ports = createEventPipelinePorts(getEnv(), bus, new NoOpAnalyticsStore());
    const wrapped = ports.wrapMemoryAccessAuditor({
      recordAccess: async () => {},
    });

    await wrapped.recordAccess({
      memoryId: 'mem-1',
      ownerId: 'owner-1',
      source: 'context.build',
    });

    expect(published).toContain('memory.accessed');
  });
});
