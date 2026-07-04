import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { AGENT_CLIENT_TYPES } from '../../src/ecosystem/types/agent-client-type.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Ecosystem API', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('GET /api/v1/ecosystem/clients returns catalog without auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/ecosystem/clients',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.count).toBeGreaterThanOrEqual(8);
    expect(body.clients.some((c: { clientType: string }) => c.clientType === 'cursor')).toBe(
      true,
    );
  });

  it('GET /api/v1/ecosystem/clients/:type returns single profile', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/ecosystem/clients/cursor',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.clientType).toBe('cursor');
    expect(body.primaryProtocol).toBe('mcp-stdio');
  });

  it('GET /api/v1/ecosystem/clients/:type returns 400 for unknown type', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/ecosystem/clients/not-a-client',
    });

    expect(response.statusCode).toBe(400);
  });

  it('GET /api/v1/capabilities includes ecosystem section', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsAgentEcosystem).toBe(true);
    expect(body.ecosystem.clients.length).toBeGreaterThanOrEqual(8);
    expect(AGENT_CLIENT_TYPES.every((t) =>
      body.ecosystem.clients.some((c: { clientType: string }) => c.clientType === t),
    )).toBe(true);
  });
});
