import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { createCloudPorts } from '../../src/composition/create-cloud-ports.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');

describe('Cloud ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when CONTROL_PLANE_ENABLED=false', () => {
    vi.stubEnv('CONTROL_PLANE_ENABLED', 'false');
    resetEnvCache();
    const ports = createCloudPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.eventConsumers).toHaveLength(0);
  });

  it('returns enabled ports with usage consumer when flags ON', () => {
    vi.stubEnv('CONTROL_PLANE_ENABLED', 'true');
    vi.stubEnv('USAGE_METER_ENABLED', 'true');
    vi.stubEnv('DR_PLATFORM_ENABLED', 'true');
    vi.stubEnv('USAGE_METER_STORE', 'memory');
    resetEnvCache();
    const ports = createCloudPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.usageMeterEnabled).toBe(true);
    expect(ports.drEnabled).toBe(true);
    expect(ports.eventConsumers).toHaveLength(1);
    expect(ports.eventConsumers[0]?.name).toBe('cloud-usage-meter');
  });
});
