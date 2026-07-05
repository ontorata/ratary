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

describe('Compression admin API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'compress-admin', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('POST /api/v1/admin/compress returns dry-run report', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/compress',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { dryRun: true },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { dryRun: boolean; candidates: number };
    expect(body.dryRun).toBe(true);
    expect(body.candidates).toBeGreaterThanOrEqual(0);
  });
});
