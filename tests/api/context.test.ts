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

describe('Context API E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    app = await buildApp({ logger: false, skipAuth: true });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('should build context and prompt for a task', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: {
        title: 'Hydration handoff',
        project: 'mangroveapps',
        content: 'Fix hydration bug in chat component',
        summary: 'Hydration fix notes',
        tags: ['hydration'],
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/context',
      payload: {
        task: 'Lanjut kerja hydration fix',
        query: 'hydration',
        projectId: 'mangroveapps',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.context).toContain('Hydration handoff');
    expect(body.system).toBeTruthy();
    expect(body.user).toContain('Lanjut kerja hydration fix');
    expect(body.memories.length).toBeGreaterThanOrEqual(1);
    expect(body.memories[0].relevanceScore).toBeGreaterThan(0);
  });

  it('should validate context request body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/context',
      payload: { query: 'missing task field' },
    });

    expect(response.statusCode).toBe(400);
  });
});
