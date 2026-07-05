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

describe('Auth API E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('should bootstrap once and reject second bootstrap', async () => {
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: {
        name: 'bootstrap',
        client: { name: 'cursor', type: 'mcp' },
      },
    });

    expect(first.statusCode).toBe(201);
    const body = first.json();
    expect(body.success).toBe(true);
    expect(body.data.apiKey).toMatch(/^aic_/);
    expect(body.data.owner_id).toBeDefined();

    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'again' },
    });

    expect(second.statusCode).toBe(403);
    expect(second.json().success).toBe(false);
  });

  it('should authenticate and access protected memory routes', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'test-key' },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const verify = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/verify',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(verify.statusCode).toBe(200);
    expect(verify.json().data.authenticated).toBe(true);

    const memory = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        title: 'Auth protected',
        content: 'Only with API key',
      },
    });
    expect(memory.statusCode).toBe(201);

    const unauth = await app.inject({
      method: 'GET',
      url: '/api/v1/memory',
    });
    expect(unauth.statusCode).toBe(401);
  });

  it('should create, list, rotate, and revoke identities', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'admin' },
    });
    const apiKey = bootstrap.json().data.apiKey as string;
    const headers = { authorization: `Bearer ${apiKey}` };

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers,
      payload: { name: 'ci-script', type: 'api_key' },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().data.apiKey).toMatch(/^aic_/);
    const identityId = created.json().data.identity.id as string;

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/identities',
      headers,
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().data.length).toBeGreaterThanOrEqual(2);

    const rotated = await app.inject({
      method: 'POST',
      url: `/api/v1/auth/identities/${identityId}/rotate`,
      headers,
    });
    expect(rotated.statusCode).toBe(200);
    const newKey = rotated.json().data.apiKey as string;

    const revoked = await app.inject({
      method: 'DELETE',
      url: `/api/v1/auth/identities/${identityId}`,
      headers,
    });
    expect(revoked.statusCode).toBe(200);
    expect(revoked.json().data.revoked).toBe(true);

    const oldKeyFails = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/verify',
      headers: { authorization: `Bearer ${created.json().data.apiKey}` },
    });
    expect(oldKeyFails.statusCode).toBe(401);

    const newKeyFails = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/verify',
      headers: { authorization: `Bearer ${newKey}` },
    });
    expect(newKeyFails.statusCode).toBe(403);
  });

  it('should return 404 for removed legacy memory routes', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'legacy' },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const res = await app.inject({
      method: 'GET',
      url: '/memory',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it('should write audit logs on auth events', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'audit-test' },
    });
    expect(mockDb.getAuditLogCount()).toBeGreaterThan(0);
  });

  it('should manage clients for current owner', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'owner', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;
    const headers = { authorization: `Bearer ${apiKey}` };

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/clients',
      headers,
      payload: { name: 'claude-code', type: 'mcp', description: 'CLI agent' },
    });
    expect(created.statusCode).toBe(201);
    const clientId = created.json().data.client.id as string;

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/clients',
      headers,
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().data.length).toBeGreaterThanOrEqual(2);

    const getOne = await app.inject({
      method: 'GET',
      url: `/api/v1/auth/clients/${clientId}`,
      headers,
    });
    expect(getOne.statusCode).toBe(200);
    expect(getOne.json().data.client.name).toBe('claude-code');

    const deactivated = await app.inject({
      method: 'PATCH',
      url: `/api/v1/auth/clients/${clientId}`,
      headers,
      payload: { active: false },
    });
    expect(deactivated.statusCode).toBe(200);
    expect(deactivated.json().data.client.active).toBe(false);
  });

  it('should isolate memories by owner_id', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'owner-a' },
    });
    const keyA = bootstrap.json().data.apiKey as string;
    const ownerIdA = bootstrap.json().data.owner_id as string;

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${keyA}` },
      payload: { title: 'Secret A', content: 'Only owner A' },
    });
    expect(created.statusCode).toBe(201);

    const ownerB = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers: { authorization: `Bearer ${keyA}` },
      payload: {
        name: 'owner-b-key',
        owner_id: '00000000-0000-4000-8000-000000000001',
      },
    });
    expect(ownerB.statusCode).toBe(201);
    const keyB = ownerB.json().data.apiKey as string;

    const listB = await app.inject({
      method: 'GET',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${keyB}` },
    });
    const listBBody = listB.json();
    expect(listBBody.total).toBe(0);

    const listA = await app.inject({
      method: 'GET',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${keyA}` },
    });
    const listABody = listA.json();
    expect(listABody.total).toBe(1);
    expect(listABody.memories[0].title).toBe('Secret A');
    expect(listABody.memories[0].ownerId).toBe(ownerIdA);
  });
});
