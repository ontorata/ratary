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

describe('Signals API (D85-05)', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('SIGNAL_INGEST_ENABLED', 'true');
    vi.stubEnv('SIGNAL_STORE_PROVIDER', 'sql');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'signals-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('POST /api/v1/signals applies helpful feedback with auth', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        title: 'Signal feedback target',
        content: 'content for signal ingest',
      },
    });
    expect(createRes.statusCode).toBe(201);
    const memoryId = createRes.json().id as string;

    const signalRes = await app.inject({
      method: 'POST',
      url: '/api/v1/signals',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        type: 'explicit_feedback',
        memoryId,
        value: 'helpful',
      },
    });

    expect(signalRes.statusCode).toBe(200);
    const body = signalRes.json() as { accepted: boolean; appliedDelta?: number };
    expect(body.accepted).toBe(true);
    expect(body.appliedDelta).toBe(5);

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryId}`,
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().importance).toBe(55);
  });

  it('returns 401 without auth when ingest enabled', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/signals',
      payload: {
        type: 'explicit_feedback',
        memoryId: '00000000-0000-4000-8000-000000000099',
        value: 'helpful',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
