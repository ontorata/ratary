import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('AI Infrastructure Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('PLUGIN_MARKETPLACE_ENABLED', 'true');
    vi.stubEnv('PLUGIN_SIGNATURE_REQUIRED', 'false');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'infra-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/infrastructure/status returns enabled flags', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/infrastructure/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.enabled).toBe(true);
    expect(body.marketplaceSource).toBe('local');
  });

  it('GET /api/v1/infrastructure/marketplace is public', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/infrastructure/marketplace',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().count).toBe(9);
  });

  it('GET /api/v1/infrastructure/plugins lists bootstrapped catalog', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/infrastructure/plugins',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().count).toBeGreaterThanOrEqual(9);
  });

  it('POST enable/disable plugin lifecycle', async () => {
    const enable = await app.inject({
      method: 'POST',
      url: '/api/v1/infrastructure/plugins/storage-postgres/enable',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(enable.statusCode).toBe(200);
    expect(enable.json().status).toBe('enabled');
    expect(enable.json().note).toContain('restart');

    const disable = await app.inject({
      method: 'POST',
      url: '/api/v1/infrastructure/plugins/storage-postgres/disable',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(disable.statusCode).toBe(200);
    expect(disable.json().status).toBe('disabled');
  });

  it('GET /api/v1/capabilities includes infrastructure section when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsPluginMarketplace).toBe(true);
    expect(body.infrastructure.platform).toBe('ai-memory-infrastructure');
    expect(body.infrastructure.plugins.storage.active).toBeTruthy();
  });
});

describe('AI Infrastructure Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('PLUGIN_MARKETPLACE_ENABLED', 'false');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());
    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('does not register infrastructure routes when disabled', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'infra-disabled', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/infrastructure/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });

  it('capabilities omits infrastructure when disabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().capabilities.supportsPluginMarketplace).toBe(false);
    expect(response.json().infrastructure).toBeUndefined();
  });
});

describe('AI Infrastructure allow-list (Phase 18 hook)', () => {
  let app: FastifyInstance;
  let apiKey: string;
  let mock: MockD1Client;

  beforeEach(async () => {
    vi.stubEnv('PLUGIN_MARKETPLACE_ENABLED', 'true');
    vi.stubEnv('CONTROL_PLANE_ENABLED', 'true');
    resetEnvCache();
    resetD1Client();
    mock = new MockD1Client();
    setD1Client(mock);

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'infra-allow', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('denies enable when tenant allow-list blocks plugin', async () => {
    const orgId = randomUUID();

    await mock.execute(
      `INSERT INTO plugin_allow_list (organization_id, plugin_id, allowed, updated_at)
       VALUES (?, ?, 0, ?)`,
      [orgId, 'storage-postgres', new Date().toISOString()],
    );

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/infrastructure/plugins/storage-postgres/enable',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { organizationId: orgId },
    });

    expect(response.statusCode).toBe(403);
  });
});
