import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Observability Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('OBSERVABILITY_PLATFORM', 'true');
    vi.stubEnv('OBS_LOG_SHIPPER', 'none');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'obs-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /metrics returns Prometheus text without auth', async () => {
    await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.body).toContain('ratary_http_requests_total');
  });

  it('GET /api/v1/observability/status returns enabled layers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.enabled).toBe(true);
    expect(body.registeredMetrics).toBeGreaterThanOrEqual(10);
  });

  it('GET /api/v1/observability/dashboards lists packs', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/dashboards',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().count).toBe(6);
  });

  it('GET /api/v1/observability/slos returns SLO definitions', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/slos',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().count).toBeGreaterThanOrEqual(4);
  });

  it('GET /api/v1/capabilities includes observability section when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsObservabilityPlatform).toBe(true);
    expect(body.observability.enabled).toBe(true);
  });
});

describe('Observability Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('OBSERVABILITY_PLATFORM', 'false');
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

  it('does not register observability routes or /metrics when disabled', async () => {
    const metrics = await app.inject({ method: 'GET', url: '/metrics' });
    expect(metrics.statusCode).toBe(404);

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'obs-off', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const status = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(status.statusCode).toBe(404);
  });
});
