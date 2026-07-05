import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Memory lifecycleState API (D85-06)', () => {
  let app: FastifyInstance;
  let apiKey: string;
  let ownerId: string;
  let mockDb: MockD1Client;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'lifecycle-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
    ownerId = bootstrap.json().data.owner_id as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('GET /api/v1/memory/:id omits lifecycleState when unset', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { title: 'No lifecycle', content: 'body' },
    });
    const memoryId = createRes.json().id as string;

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryId}`,
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(getRes.statusCode).toBe(200);
    expect(getRes.json()).not.toHaveProperty('lifecycleState');
  });

  it('GET /api/v1/memory/:id returns lifecycleState when set', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { title: 'With lifecycle', content: 'body' },
    });
    const memoryId = createRes.json().id as string;

    const repository = new MemoryRepository(asSqlDatabase(mockDb));
    await repository.setLifecycleState(memoryId, ownerId, 'stale');

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryId}`,
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().lifecycleState).toBe('stale');
  });
});
