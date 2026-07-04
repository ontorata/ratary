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

describe('Search Graph Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('SEARCH_GRAPH_PLATFORM_ENABLED', 'true');
    vi.stubEnv('MEILISEARCH_HOST', 'http://127.0.0.1:7700');
    vi.stubEnv('MEILISEARCH_INDEX', 'memories');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'search-graph-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/search-graph/status returns enabled flags', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/search-graph/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.enabled).toBe(true);
    expect(body.searchProvider).toBe('sql');
  });

  it('GET /api/v1/search-graph/manifest returns platform manifest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/search-graph/manifest',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().platform).toBe('search-graph-production');
    expect(response.json().meilisearchConfigured).toBe(true);
  });

  it('POST /api/v1/search-graph/sync/search dry-run completes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/search-graph/sync/search',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { mode: 'full', dryRun: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('completed');
    expect(response.json().target).toBe('meilisearch');
  });

  it('GET /api/v1/capabilities includes searchGraph when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsSearchGraphPlatform).toBe(true);
    expect(body.searchGraph.platform).toBe('search-graph-production');
  });
});

describe('Search Graph Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('SEARCH_GRAPH_PLATFORM_ENABLED', 'false');
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

  it('does not register search-graph routes when disabled', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'sg-disabled', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/search-graph/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });
});
