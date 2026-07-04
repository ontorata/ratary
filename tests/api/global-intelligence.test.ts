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

describe('Global Intelligence API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('GLOBAL_INTELLIGENCE_PLATFORM_ENABLED', 'true');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'intelligence-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/intelligence/status returns enabled flag', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/intelligence/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().enabled).toBe(true);
  });

  it('GET /api/v1/intelligence/manifest returns capstone manifest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/intelligence/manifest',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().platform).toBe('global-ai-intelligence');
    expect(response.json().syncTiers.length).toBe(5);
  });

  it('GET /api/v1/intelligence/analytics/adoption returns report', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/intelligence/analytics/adoption',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('eventCount');
  });

  it('POST /api/v1/intelligence/sync dry-run succeeds', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/intelligence/sync',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { tier: 'workspace', direction: 'pull', dryRun: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().dryRun).toBe(true);
  });
});
