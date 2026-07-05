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

describe('Knowledge API E2E', () => {
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

  it('should create memory with codename and slug', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: {
        title: 'Fastify Auth',
        content: 'JWT middleware',
        memoryType: 'architecture',
        category: 'Development',
        tags: ['auth'],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.codename).toMatch(/^ARCH-\d{4}$/);
    expect(body.slug).toBe('fastify-auth');
    expect(body.memoryType).toBe('architecture');
  });

  it('should get memory by codename', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: { title: 'Codename Test', content: 'body', memoryType: 'note' },
    });
    const { codename } = created.json();

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/by-codename/${codename}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().codename).toBe(codename);
  });

  it('should list categories and memory types', async () => {
    const typesRes = await app.inject({ method: 'GET', url: '/api/v1/memory-types' });
    expect(typesRes.statusCode).toBe(200);
    expect(typesRes.json().memoryTypes).toContain('note');

    const catRes = await app.inject({ method: 'GET', url: '/api/v1/categories' });
    expect(catRes.statusCode).toBe(200);
    expect(Array.isArray(catRes.json().categories)).toBe(true);
  });

  it('should search with relevanceScore', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: {
        title: 'JWT Auth Guide',
        content: 'middleware',
        memoryType: 'architecture',
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/search',
      query: { q: 'JWT' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.memories.length).toBeGreaterThanOrEqual(1);
    expect(body.memories[0].relevanceScore).toBeGreaterThan(0);
  });

  it('should create and list relations', async () => {
    const a = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: { title: 'Source', content: 'a' },
    });
    const b = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: { title: 'Target', content: 'b' },
    });
    const sourceId = a.json().id;
    const targetId = b.json().id;

    const createRel = await app.inject({
      method: 'POST',
      url: `/api/v1/memory/${sourceId}/relations`,
      payload: { targetMemoryId: targetId, relation: 'depends_on' },
    });
    expect(createRel.statusCode).toBe(201);

    const listRel = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${sourceId}/relations`,
    });
    expect(listRel.statusCode).toBe(200);
    expect(listRel.json().relations.length).toBe(1);
  });

  it('should delete relation', async () => {
    const a = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: { title: 'S', content: 'a' },
    });
    const b = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: { title: 'T', content: 'b' },
    });
    const sourceId = a.json().id;
    const targetId = b.json().id;

    const created = await app.inject({
      method: 'POST',
      url: `/api/v1/memory/${sourceId}/relations`,
      payload: { targetMemoryId: targetId, relation: 'related' },
    });
    const relationId = created.json().id;

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/v1/memory/${sourceId}/relations/${relationId}`,
    });
    expect(del.statusCode).toBe(204);
  });
});
