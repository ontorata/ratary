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

const catalogJson = JSON.stringify({
  notion: [
    {
      externalId: 'notion-page-1',
      title: 'Runbook',
      body: 'Deployment steps for staging environment',
      updatedAt: '2026-07-04T00:00:00.000Z',
      metadata: {},
    },
  ],
});

describe('Knowledge Fabric Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('KNOWLEDGE_FABRIC_ENABLED', 'true');
    vi.stubEnv('KNOWLEDGE_FABRIC_CATALOG_JSON', catalogJson);
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'knowledge-fabric-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/knowledge-fabric/status returns enabled flags', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/knowledge-fabric/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().enabled).toBe(true);
    expect(response.json().catalogConfigured).toBe(true);
  });

  it('GET /api/v1/knowledge-fabric/manifest returns platform manifest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/knowledge-fabric/manifest',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().platform).toBe('enterprise-knowledge-fabric');
    expect(response.json().connectors.some((c: { id: string; configured: boolean }) => c.id === 'notion' && c.configured)).toBe(true);
  });

  it('POST /api/v1/knowledge-fabric/ingest/notion dry-run completes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/knowledge-fabric/ingest/notion',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { mode: 'full', dryRun: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('completed');
    expect(response.json().connectorId).toBe('notion');
    expect(response.json().stats.created).toBe(1);
  });

  it('GET /api/v1/capabilities includes knowledgeFabric when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsKnowledgeFabric).toBe(true);
    expect(body.knowledgeFabric.platform).toBe('enterprise-knowledge-fabric');
  });
});

describe('Knowledge Fabric Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('KNOWLEDGE_FABRIC_ENABLED', 'false');
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

  it('does not register knowledge-fabric routes when disabled', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'kf-disabled', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/knowledge-fabric/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });
});
