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

describe('Content Scale Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('CONTENT_SCALE_PLATFORM_ENABLED', 'true');
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 'r2');
    vi.stubEnv('R2_BUCKET_NAME', 'test-bucket');
    vi.stubEnv('R2_ACCESS_KEY_ID', 'test-key');
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'content-scale-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/content-scale/status returns enabled flags', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content-scale/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().enabled).toBe(true);
    expect(response.json().objectStorageProvider).toBe('r2');
  });

  it('GET /api/v1/content-scale/manifest returns platform manifest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content-scale/manifest',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().platform).toBe('content-vector-scale');
    expect(response.json().contentOffloadConfigured).toBe(true);
  });

  it('POST /api/v1/content-scale/sync/content dry-run completes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/content-scale/sync/content',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { mode: 'full', dryRun: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('completed');
    expect(response.json().target).toBe('content');
  });

  it('GET /api/v1/capabilities includes contentScale when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsContentScalePlatform).toBe(true);
    expect(body.contentScale.platform).toBe('content-vector-scale');
  });
});

describe('Content Scale Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('CONTENT_SCALE_PLATFORM_ENABLED', 'false');
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

  it('does not register content-scale routes when disabled', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'cs-disabled', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content-scale/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });
});
