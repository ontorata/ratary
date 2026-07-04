import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { randomUUID } from 'node:crypto';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Cloud Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;
  let ownerId: string;
  let workspaceId: string;

  beforeEach(async () => {
    vi.stubEnv('CONTROL_PLANE_ENABLED', 'true');
    vi.stubEnv('USAGE_METER_ENABLED', 'true');
    vi.stubEnv('DR_PLATFORM_ENABLED', 'true');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'cloud-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
    ownerId = bootstrap.json().data.owner_id as string;

    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    workspaceId = (listRes.json().workspaces as Array<{ id: string }>)[0]!.id;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/cloud/status returns enabled layers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/cloud/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.enabled).toBe(true);
    expect(body.usageMeterEnabled).toBe(true);
    expect(body.drEnabled).toBe(true);
  });

  it('POST /api/v1/cloud/workspaces/provision creates tenant metadata', async () => {
    const orgId = randomUUID();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cloud/workspaces/provision',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        organizationId: orgId,
        workspaceId,
        ownerId,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.organizationId).toBe(orgId);
    expect(body.workspaceId).toBe(workspaceId);
    expect(body.status).toBe('active');
  });

  it('GET /api/v1/cloud/workspaces/:id/topology returns region assignment', async () => {
    const orgId = randomUUID();
    await app.inject({
      method: 'POST',
      url: '/api/v1/cloud/workspaces/provision',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { organizationId: orgId, workspaceId, ownerId },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/cloud/workspaces/${workspaceId}/topology?organizationId=${orgId}`,
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.primaryRegion.code).toBe('local');
    expect(body.workspaceId).toBe(workspaceId);
  });

  it('GET /api/v1/capabilities includes cloud section when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsCloudPlatform).toBe(true);
    expect(body.cloud.enabled).toBe(true);
  });
});

describe('Cloud Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('CONTROL_PLANE_ENABLED', 'false');
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

  it('does not register cloud routes when disabled', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'cloud-disabled', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/cloud/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });
});
