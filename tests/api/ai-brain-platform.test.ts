import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { DomainEventTopics } from '../../src/events/domain-event-topics.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('AI Brain Platform API', () => {
  let app: FastifyInstance;
  let apiKey: string;

  beforeEach(async () => {
    vi.stubEnv('AI_BRAIN_PLATFORM_ENABLED', 'true');
    vi.stubEnv('PLATFORM_WEBHOOKS_ENABLED', 'true');
    vi.stubEnv('AI_BRAIN_PLATFORM_EDITION', 'enterprise');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'platform-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /api/v1/platform/status returns edition', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/platform/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().enabled).toBe(true);
    expect(response.json().edition).toBe('enterprise');
  });

  it('GET /api/v1/platform/manifest returns umbrella manifest', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/platform/manifest',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().platform).toBe('ai-brain-platform');
    expect(response.json().planes.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/platform/webhooks creates subscription', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/platform/webhooks',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        url: 'https://example.com/hook',
        topics: [DomainEventTopics.MEMORY_CREATED],
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().url).toBe('https://example.com/hook');
  });

  it('GET /api/v1/capabilities includes aiBrainPlatform when enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsAiBrainPlatform).toBe(true);
    expect(body.aiBrainPlatform.platform).toBe('ai-brain-platform');
  });
});

describe('AI Brain Platform API (disabled)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('AI_BRAIN_PLATFORM_ENABLED', 'false');
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

  it('does not register platform routes when disabled', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'platform-off', client: { name: 'cursor', type: 'mcp' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/platform/status',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });
});
