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

describe('Inspection patterns API (8.8D)', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('INSPECTION_LEDGER_ENABLED', 'true');
    vi.stubEnv('INSPECTION_LEDGER_STORE_PROVIDER', 'sql');
    vi.stubEnv('LEARNING_ENGINE_ENABLED', 'true');
    vi.stubEnv('LEARNING_STORE_PROVIDER', 'sql');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'inspection-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/inspection-patterns returns empty ledger with auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/inspection-patterns',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { patterns: unknown[]; contradictions: unknown[] };
    expect(body.patterns).toEqual([]);
    expect(body.contradictions).toEqual([]);
  });
});
