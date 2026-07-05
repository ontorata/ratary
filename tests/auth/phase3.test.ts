import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
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

describe('Phase 3 Auth', () => {
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

  async function bootstrapAdmin(): Promise<string> {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'admin' },
    });
    return bootstrap.json().data.apiKey as string;
  }

  it('should issue and authenticate JWT', async () => {
    const apiKey = await bootstrapAdmin();
    const headers = { authorization: `Bearer ${apiKey}` };

    const tokenRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/token',
      headers,
      payload: { expires_in: 3600 },
    });
    expect(tokenRes.statusCode).toBe(200);
    const jwt = tokenRes.json().data.token as string;

    const memory = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${jwt}` },
      payload: { title: 'JWT access', content: 'via jwt' },
    });
    expect(memory.statusCode).toBe(201);
  });

  it('should authenticate OAuth token identities', async () => {
    const apiKey = await bootstrapAdmin();
    const headers = { authorization: `Bearer ${apiKey}` };

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers,
      payload: { name: 'oauth-client', type: 'oauth' },
    });
    expect(created.statusCode).toBe(201);
    const oauthToken = created.json().data.oauthToken as string;
    expect(oauthToken).toMatch(/^oac_/);

    const memory = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${oauthToken}` },
      payload: { title: 'OAuth access', content: 'via oauth token' },
    });
    expect(memory.statusCode).toBe(201);
  });

  it('should deny write when identity only has memory.read', async () => {
    const apiKey = await bootstrapAdmin();
    const headers = { authorization: `Bearer ${apiKey}` };

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers,
      payload: {
        name: 'read-only',
        type: 'api_key',
        metadata: { permissions: ['memory.read'] },
      },
    });
    const readOnlyKey = created.json().data.apiKey as string;

    const read = await app.inject({
      method: 'GET',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${readOnlyKey}` },
    });
    expect(read.statusCode).toBe(200);

    const write = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${readOnlyKey}` },
      payload: { title: 'Denied', content: 'should fail' },
    });
    expect(write.statusCode).toBe(403);
    expect(write.json().message).toContain('memory.write');
  });
});
