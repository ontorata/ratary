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

describe('Client sync API (Phase 09.8)', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('MULTI_CLIENT_SYNC_ENABLED', 'true');
    vi.stubEnv('MULTI_CLIENT_SYNC_STORE_PROVIDER', 'sql');
    vi.stubEnv('MULTI_CLIENT_SYNC_STRATEGY', 'field_merge');
    vi.stubEnv('MEMORY_EVOLUTION_ENABLED', 'true');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'sync-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('pull → push round-trip with field_merge', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        title: 'Sync source memory',
        content: 'initial body',
        project: 'sync-test',
      },
    });
    expect(createRes.statusCode).toBe(201);
    const memoryId = createRes.json().id as string;

    const statusRes = await app.inject({
      method: 'GET',
      url: '/api/v1/sync/status?platformId=cursor',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.json().platformId).toBe('cursor');

    const pullRes = await app.inject({
      method: 'GET',
      url: '/api/v1/sync/pull?platformId=cursor',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(pullRes.statusCode).toBe(200);
    expect(pullRes.json().memories.length).toBeGreaterThan(0);

    const pushRes = await app.inject({
      method: 'POST',
      url: '/api/v1/sync/push',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        platformId: 'cursor',
        changes: [
          {
            memoryId,
            operation: 'update',
            data: { summary: 'merged via sync push', tags: ['synced'] },
          },
        ],
      },
    });
    expect(pushRes.statusCode).toBe(200);
    expect(pushRes.json().accepted).toBe(1);

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryId}`,
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(getRes.json().summary).toBe('merged via sync push');
    expect(getRes.json().tags).toContain('synced');
  });
});
