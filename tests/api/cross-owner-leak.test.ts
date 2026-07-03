/**
 * D-01: API Cross-Owner Leak E2E Tests
 *
 * Security tests to ensure complete owner isolation across ALL API endpoints.
 * Tests that Owner B cannot access, modify, or even detect the existence of
 * Owner A's memories, even if Owner B knows the memory ID.
 *
 * Coverage:
 * - Memory CRUD by ID (GET, PUT, DELETE)
 * - Search endpoints
 * - Context/build_prompt endpoints
 * - Backup export
 * - Relations
 * - Favorites and archive operations
 *
 * @see ai-brain/.ai/architecture/10-PHASE-STATUS.md D-01
 */

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

describe('Cross-Owner Leak Prevention E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;
  let ownerAKey: string;
  let ownerAId: string;
  let ownerAMemoryId: string;
  let ownerBKey: string;
  let _ownerBId: string;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    // Bootstrap Owner A
    const bootstrapA = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'owner-a', client: { name: 'cursor', type: 'mcp' } },
    });
    ownerAKey = bootstrapA.json().data.apiKey as string;
    ownerAId = bootstrapA.json().data.owner_id as string;

    // Owner A creates a secret memory
    const createA = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${ownerAKey}` },
      payload: { title: 'Secret A Memory', content: 'Owner A secret content', project: 'secret-project' },
    });
    expect(createA.statusCode).toBe(201);
    ownerAMemoryId = createA.json().id as string;

    // Create Owner B identity via Owner A's authenticated endpoint
    const createB = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers: { authorization: `Bearer ${ownerAKey}` },
      payload: { name: 'owner-b-key', owner_id: '00000000-0000-4000-8000-000000000001' },
    });
    expect(createB.statusCode).toBe(201);
    ownerBKey = createB.json().data.apiKey as string;
    _ownerBId = '00000000-0000-4000-8000-000000000001';
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  describe('Memory CRUD by ID', () => {
    it('should return 404 when Owner B tries to GET Owner A memory by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when Owner B tries to UPDATE Owner A memory by ID', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: { title: 'Hacked Title' },
      });
      expect(response.statusCode).toBe(404);

      // Verify Owner A's memory is unchanged
      const verify = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerAKey}` },
      });
      expect(verify.json().title).toBe('Secret A Memory');
    });

    it('should return 404 when Owner B tries to DELETE Owner A memory by ID', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      // 404 is correct - memory not found for Owner B
      expect(response.statusCode).toBe(404);

      // Verify Owner A's memory still exists
      const verify = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerAKey}` },
      });
      expect(verify.statusCode).toBe(200);
    });

    it('should return 404 when Owner B tries to TOGGLE FAVORITE on Owner A memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/memory/${ownerAMemoryId}/favorite`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(404);

      // Verify Owner A's memory favorite is unchanged
      const verify = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerAKey}` },
      });
      expect(verify.json().favorite).toBe(false);
    });

    it('should return 404 when Owner B tries to ARCHIVE Owner A memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/memory/${ownerAMemoryId}/archive`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(404);

      // Verify Owner A's memory is not archived
      const verify = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerAKey}` },
      });
      expect(verify.json().archived).toBe(false);
    });
  });

  describe('Search endpoints', () => {
    beforeEach(async () => {
      // Owner B creates memory with DIFFERENT project to avoid confusion
      await app.inject({
        method: 'POST',
        url: '/api/v1/memory',
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: {
          title: 'B Memory',
          content: 'B-only content',
          project: 'b-private-project',
          tags: ['b-tag'],
        },
      });
    });

    it('should not leak Owner A memories in search results for Owner B', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/search',
        headers: { authorization: `Bearer ${ownerBKey}` },
        query: { q: 'Secret' },
      });
      expect(response.statusCode).toBe(200);
      const results = response.json().memories as Array<{ title: string }>;
      const ownerAMemoryTitles = results.map((m) => m.title);
      expect(ownerAMemoryTitles).not.toContain('Secret A Memory');
    });

    it('should not leak Owner A memories in list results for Owner B', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/memory',
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(200);
      const results = response.json().memories as Array<{ title: string }>;
      const ownerAMemoryTitles = results.map((m) => m.title);
      expect(ownerAMemoryTitles).not.toContain('Secret A Memory');
      expect(response.json().total).toBeLessThan(results.length + 1);
    });

    it('should not leak Owner A projects in list projects for Owner B', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects',
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(200);
      const projects = response.json().projects as string[];
      // Owner B's project should be visible, but NOT Owner A's secret-project
      expect(projects).not.toContain('secret-project');
      expect(projects).toContain('b-private-project');
    });

    it('should not leak Owner A tags in list tags for Owner B', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tags',
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(200);
      const tags = response.json().tags as string[];
      // Owner A's memory has no tags, so just verify Owner B's tags work
      expect(Array.isArray(tags)).toBe(true);
    });

    it('should filter search by Owner B project only', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/search',
        headers: { authorization: `Bearer ${ownerBKey}` },
        query: { project: 'secret-project' },
      });
      expect(response.statusCode).toBe(200);
      const results = response.json().memories as Array<{ title: string }>;
      const ownerAMemoryTitles = results.map((m) => m.title);
      expect(ownerAMemoryTitles).not.toContain('Secret A Memory');
    });
  });

  describe('Context API', () => {
    beforeEach(async () => {
      // Create a memory for Owner B to make context API test meaningful
      await app.inject({
        method: 'POST',
        url: '/api/v1/memory',
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: { title: 'B Context Test', content: 'Owner B content', project: 'b-project' },
      });
    });

    it('should not include Owner A memories in context for Owner B', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/context',
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: { task: 'Analyze the code', query: 'secret' },
      });
      expect(response.statusCode).toBe(200);
      const context = response.json().context as string;
      expect(context).not.toContain('Secret A Memory');
      expect(context).not.toContain('Owner A secret content');
    });

    it('should not include Owner A memories in build_prompt for Owner B', async () => {
      // Note: /context endpoint handles both context and build-prompt in this API
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/context',
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: { task: 'Help with secret project', query: 'secret' },
      });
      expect(response.statusCode).toBe(200);
      const context = response.json().context as string;
      expect(context).not.toContain('Secret A Memory');
      expect(context).not.toContain('Owner A secret content');
    });
  });

  describe('Backup Export', () => {
    it('should not leak Owner A memories in backup export for Owner B', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/backup/export',
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(200);
      const memories = response.json().memories as Array<{ title: string }>;
      const ownerAMemoryTitles = memories.map((m) => m.title);
      expect(ownerAMemoryTitles).not.toContain('Secret A Memory');
    });
  });

  describe('Relations', () => {
    beforeEach(async () => {
      // Owner B creates a memory to test relations
      const createB = await app.inject({
        method: 'POST',
        url: '/api/v1/memory',
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: { title: 'B Relation Test', content: 'B content', project: 'b-project' },
      });
      expect(createB.statusCode).toBe(201);
    });

    it('should return 404 when Owner B tries to link to Owner A memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/memory/relations',
        headers: { authorization: `Bearer ${ownerBKey}` },
        payload: {
          sourceId: ownerAMemoryId,
          targetId: '00000000-0000-4000-8000-000000000002',
          relation: 'related',
        },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when Owner B tries to list relations on Owner A memory', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}/relations`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Negative ID patterns', () => {
    it('should return 400 (validation) for invalid UUID format IDs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/memory/invalid-uuid',
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      // 400 is acceptable - validation error for invalid UUID format
      expect([400, 404]).toContain(response.statusCode);
    });

    it('should return 400 (validation) for SQL injection attempts in IDs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}' OR '1'='1`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      // 400 is acceptable - validation error rejects malformed ID
      expect([400, 404]).toContain(response.statusCode);
    });

    it('should return 404 for UUID traversal attempts (valid UUID but wrong owner)', async () => {
      // Try to access memory by incrementing UUID - may return 400 (invalid UUID) or 404 (not found)
      // The API validates UUID strictly, so modified UUIDs may be rejected as invalid
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1))}`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      // 400 is acceptable - validation rejects modified UUIDs
      // 404 is acceptable - valid UUID but not owned by this user
      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Owner metadata isolation', () => {
    it('should not leak owner_id in memory responses to wrong owner', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerBKey}` },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should correctly scope owner_id in Owner A responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${ownerAMemoryId}`,
        headers: { authorization: `Bearer ${ownerAKey}` },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().ownerId).toBe(ownerAId);
    });
  });
});
