import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';
import { setD1Client, resetD1Client } from '../src/db/index.js';
import { resetEnvCache } from '../src/config/index.js';
import { MockD1Client } from './helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('REST API', () => {
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

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({ method: 'GET', url: '/health' });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('ok');
      expect(body.service).toBe('ai-memory-cloud');
      expect(body.checks.database).toBe('ok');
    });
  });

  describe('Memory CRUD', () => {
    it('should create, read, update, and delete memory', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/memory',
        payload: {
          title: 'Login JWT',
          project: 'auth-service',
          content: '# Login JWT\n\nMenggunakan JWT HS256',
          summary: 'JWT auth',
          tags: ['auth', 'jwt'],
          favorite: true,
        },
      });

      expect(createRes.statusCode).toBe(201);
      const created = createRes.json();
      expect(created.id).toBeDefined();
      expect(created.title).toBe('Login JWT');

      const getRes = await app.inject({ method: 'GET', url: `/memory/${created.id}` });
      expect(getRes.statusCode).toBe(200);
      expect(getRes.json().content).toContain('JWT HS256');

      const updateRes = await app.inject({
        method: 'PUT',
        url: `/memory/${created.id}`,
        payload: { title: 'Updated JWT' },
      });
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.json().title).toBe('Updated JWT');

      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/memory/${created.id}`,
      });
      expect(deleteRes.statusCode).toBe(204);

      const notFoundRes = await app.inject({
        method: 'GET',
        url: `/memory/${created.id}`,
      });
      expect(notFoundRes.statusCode).toBe(404);
    });

    it('should validate create input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memory',
        payload: { title: '' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /search', () => {
    it('should search memories', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/memory',
        payload: {
          title: 'JWT Auth',
          content: 'JWT HS256 middleware',
          project: 'auth',
          tags: ['jwt'],
        },
      });
      expect(createRes.statusCode).toBe(201);

      const listRes = await app.inject({ method: 'GET', url: '/memory' });
      expect(listRes.json().total).toBeGreaterThanOrEqual(1);

      const response = await app.inject({
        method: 'GET',
        url: '/search',
        query: { q: 'JWT' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().memories.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /memory/:id/favorite', () => {
    it('should toggle favorite', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/memory',
        payload: { title: 'Test', content: 'Content' },
      });
      const { id } = createRes.json();

      const favRes = await app.inject({
        method: 'POST',
        url: `/memory/${id}/favorite`,
      });

      expect(favRes.statusCode).toBe(200);
      expect(favRes.json().favorite).toBe(true);
    });
  });

  describe('Backup', () => {
    it('should export and import backup', async () => {
      await app.inject({
        method: 'POST',
        url: '/memory',
        payload: {
          title: 'Backup Item',
          content: 'Backup content',
          project: 'test',
        },
      });

      const exportRes = await app.inject({ method: 'GET', url: '/backup/export' });
      expect(exportRes.statusCode).toBe(200);
      expect(exportRes.json().memories.length).toBeGreaterThanOrEqual(1);

      const importRes = await app.inject({
        method: 'POST',
        url: '/backup/import',
        payload: {
          memories: [
            {
              title: 'Imported Item',
              content: 'Imported content',
              project: 'imported',
              tags: ['test'],
            },
          ],
        },
      });

      expect(importRes.statusCode).toBe(200);
      expect(importRes.json().imported).toBe(1);
    });
  });
});
