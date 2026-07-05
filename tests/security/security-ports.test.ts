import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { createSecurityPorts } from '../../src/composition/create-security-ports.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');

describe('Security ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when ENTERPRISE_SECURITY_V2=false', () => {
    vi.stubEnv('ENTERPRISE_SECURITY_V2', 'false');
    resetEnvCache();
    const ports = createSecurityPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
  });

  it('returns enabled ports when ENTERPRISE_SECURITY_V2=true', () => {
    vi.stubEnv('ENTERPRISE_SECURITY_V2', 'true');
    vi.stubEnv('POLICY_ENGINE', 'rule-based');
    vi.stubEnv('QUOTA_ENFORCER', 'memory');
    resetEnvCache();
    const ports = createSecurityPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
  });
});
