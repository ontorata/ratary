/**
 * Phase 9 — Cross-Workspace Leak E2E Tests
 *
 * Same owner, two workspaces: memories in workspace A must not be visible or
 * mutable when the client sends X-Workspace-Id for workspace B (404 pattern).
 *
 * @see docs/adr/007-multi-ai-workspace-scope.md
 * @see tests/api/cross-owner-leak.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import type { D1Client } from '../../src/db/d1-client.js';
import { resetEnvCache } from '../../src/config/index.js';
import { findDefaultWorkspace } from '../../src/scope/workspace-store.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

const WORKSPACE_B_ID = '00000000-0000-4000-8000-0000000000b1';

async function seedWorkspace(
  db: D1Client,
  ownerId: string,
  workspace: { id: string; name: string; slug: string },
): Promise<void> {
  await db.execute(
    `INSERT INTO workspaces (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
    [workspace.id, ownerId, workspace.name, workspace.slug, new Date().toISOString()],
  );
}

function authHeaders(apiKey: string, workspaceId?: string): Record<string, string> {
  const headers: Record<string, string> = { authorization: `Bearer ${apiKey}` };
  if (workspaceId) {
    headers['x-workspace-id'] = workspaceId;
  }
  return headers;
}

describe('Cross-Workspace Leak Prevention E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;
  let ownerKey: string;
  let ownerId: string;
  let defaultWorkspaceId: string;
  let workspaceAMemoryId: string;
  let workspaceBMemoryId: string;

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
      payload: { name: 'workspace-owner', client: { name: 'cursor', type: 'mcp' } },
    });
    ownerKey = bootstrap.json().data.apiKey as string;
    ownerId = bootstrap.json().data.owner_id as string;

    const createA = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey),
      payload: {
        title: 'Secret Workspace A Memory',
        content: 'Workspace A secret content',
        project: 'ws-a-project',
        tags: ['ws-a-tag'],
      },
    });
    expect(createA.statusCode).toBe(201);
    workspaceAMemoryId = createA.json().id as string;

    const defaultWs = await findDefaultWorkspace(mockDb, ownerId);
    expect(defaultWs).not.toBeNull();
    defaultWorkspaceId = defaultWs!.id;

    await seedWorkspace(mockDb, ownerId, {
      id: WORKSPACE_B_ID,
      name: 'Team B',
      slug: 'team-b',
    });

    const createB = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      payload: {
        title: 'Workspace B Memory',
        content: 'Workspace B only content',
        project: 'ws-b-project',
        tags: ['ws-b-tag'],
      },
    });
    expect(createB.statusCode).toBe(201);
    workspaceBMemoryId = createB.json().id as string;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    resetD1Client();
    resetEnvCache();
    vi.stubEnv('GRAPH_RETRIEVAL', 'false');
  });

  describe('Scope resolution', () => {
    it('should return 404 when X-Workspace-Id does not belong to the owner', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, '00000000-0000-4000-8000-000000000099'),
      });
      expect(response.statusCode).toBe(404);
    });

    it('should allow access with the correct workspace header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, defaultWorkspaceId),
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().title).toBe('Secret Workspace A Memory');
    });
  });

  describe('Memory CRUD by ID', () => {
    it('should return 404 when workspace B client tries to GET workspace A memory', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when workspace B client tries to UPDATE workspace A memory', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
        payload: { title: 'Hacked Title' },
      });
      expect(response.statusCode).toBe(404);

      const verify = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, defaultWorkspaceId),
      });
      expect(verify.json().title).toBe('Secret Workspace A Memory');
    });

    it('should return 404 when workspace B client tries to DELETE workspace A memory', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(404);

      const verify = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${workspaceAMemoryId}`,
        headers: authHeaders(ownerKey, defaultWorkspaceId),
      });
      expect(verify.statusCode).toBe(200);
    });

    it('should return 404 when workspace B client tries to toggle favorite on workspace A memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/memory/${workspaceAMemoryId}/favorite`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when workspace B client tries to archive workspace A memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/memory/${workspaceAMemoryId}/archive`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Search and list endpoints', () => {
    it('should not leak workspace A memories in search for workspace B scope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/search',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
        query: { q: 'Secret' },
      });
      expect(response.statusCode).toBe(200);
      const titles = (response.json().memories as Array<{ title: string }>).map((m) => m.title);
      expect(titles).not.toContain('Secret Workspace A Memory');
    });

    it('should not leak workspace A memories in list for workspace B scope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/memory',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(200);
      const titles = (response.json().memories as Array<{ title: string }>).map((m) => m.title);
      expect(titles).not.toContain('Secret Workspace A Memory');
      expect(titles).toContain('Workspace B Memory');
    });

    it('should not leak workspace A projects in list projects for workspace B scope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(200);
      const projects = response.json().projects as string[];
      expect(projects).not.toContain('ws-a-project');
      expect(projects).toContain('ws-b-project');
    });

    it('should not leak workspace A tags in list tags for workspace B scope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tags',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(200);
      const tags = response.json().tags as string[];
      expect(tags).not.toContain('ws-a-tag');
      expect(tags).toContain('ws-b-tag');
    });
  });

  describe('Context API', () => {
    it('should not include workspace A memories in context for workspace B scope', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/context',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
        payload: { task: 'Analyze', query: 'secret workspace' },
      });
      expect(response.statusCode).toBe(200);
      const context = response.json().context as string;
      expect(context).not.toContain('Secret Workspace A Memory');
      expect(context).not.toContain('Workspace A secret content');
    });
  });

  describe('Backup export', () => {
    it('should not include workspace A memories in backup for workspace B scope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/backup/export',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(200);
      const titles = (response.json().memories as Array<{ title: string }>).map((m) => m.title);
      expect(titles).not.toContain('Secret Workspace A Memory');
      expect(titles).toContain('Workspace B Memory');
    });
  });

  describe('Relations', () => {
    it('should return 404 when workspace B client lists relations on workspace A memory', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/memory/${workspaceAMemoryId}/relations`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
      });
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 when workspace B client links from workspace A memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/memory/${workspaceAMemoryId}/relations`,
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
        payload: {
          targetMemoryId: workspaceBMemoryId,
          relation: 'related',
        },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Graph API', () => {
    it('should return 404 when workspace B client traverses from workspace A seed memory', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/graph/traverse',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
        payload: { memoryId: workspaceAMemoryId, depth: 2 },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Context API with graph retrieval enabled', () => {
    let graphApp: FastifyInstance;

    beforeEach(async () => {
      await app.close();
      resetD1Client();
      resetEnvCache();
      mockDb = new MockD1Client();
      setD1Client(mockDb);
      vi.stubEnv('GRAPH_RETRIEVAL', 'true');

      graphApp = await buildApp({ logger: false, skipAuth: false });
      await graphApp.ready();

      const bootstrap = await graphApp.inject({
        method: 'POST',
        url: '/api/v1/auth/bootstrap',
        payload: { name: 'graph-ws-owner', client: { name: 'cursor', type: 'mcp' } },
      });
      const graphOwnerKey = bootstrap.json().data.apiKey as string;
      const graphOwnerId = bootstrap.json().data.owner_id as string;

      const seedA = await graphApp.inject({
        method: 'POST',
        url: '/api/v1/memory',
        headers: authHeaders(graphOwnerKey),
        payload: {
          title: 'Graph workspace A seed',
          content: 'Graph secret keyword in default workspace',
          project: 'graph-ws-a',
        },
      });
      const neighborA = await graphApp.inject({
        method: 'POST',
        url: '/api/v1/memory',
        headers: authHeaders(graphOwnerKey),
        payload: {
          title: 'Graph workspace A neighbor',
          content: 'Reachable only via default workspace edge',
          project: 'graph-ws-a',
        },
      });

      await graphApp.inject({
        method: 'POST',
        url: `/api/v1/memory/${seedA.json().id}/relations`,
        headers: authHeaders(graphOwnerKey),
        payload: {
          targetMemoryId: neighborA.json().id,
          relation: 'depends_on',
        },
      });

      await seedWorkspace(mockDb, graphOwnerId, {
        id: WORKSPACE_B_ID,
        name: 'Graph Team B',
        slug: 'graph-team-b',
      });

      await graphApp.inject({
        method: 'POST',
        url: '/api/v1/memory',
        headers: authHeaders(graphOwnerKey, WORKSPACE_B_ID),
        payload: {
          title: 'Graph workspace B decoy',
          content: 'graph secret keyword in workspace B only',
          project: 'graph-ws-b',
        },
      });

      ownerKey = graphOwnerKey;
    });

    afterEach(async () => {
      if (graphApp) {
        await graphApp.close();
      }
    });

    it('should not include workspace A graph neighbors in context for workspace B scope', async () => {
      const response = await graphApp.inject({
        method: 'POST',
        url: '/api/v1/context',
        headers: authHeaders(ownerKey, WORKSPACE_B_ID),
        payload: { task: 'Analyze graph leak', query: 'Graph workspace A seed' },
      });

      expect(response.statusCode).toBe(200);
      const context = response.json().context as string;
      expect(context).not.toContain('Graph workspace A seed');
      expect(context).not.toContain('Graph workspace A neighbor');
      expect(context).not.toContain('Reachable only via default workspace edge');
    });
  });
});
