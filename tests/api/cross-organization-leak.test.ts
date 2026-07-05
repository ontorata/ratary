/**
 * Phase 10 — Cross-Organization / RBAC Leak E2E Tests
 *
 * When ENTERPRISE_RBAC=true, workspace access requires workspace_memberships.
 * Memories in organization A must not be accessible via organization B workspace
 * without explicit membership (403 Forbidden).
 *
 * @see .ai/adr/010-workspace-membership-rbac.md
 * @see tests/api/cross-workspace-leak.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('ENTERPRISE_RBAC', 'true');

const ORG_A_ID = '00000000-0000-4000-8000-0000000000a1';
const ORG_B_ID = '00000000-0000-4000-8000-0000000000b2';
const WS_A_ID = '00000000-0000-4000-8000-00000000a001';
const WS_B_ID = '00000000-0000-4000-8000-00000000b002';

function authHeaders(apiKey: string, workspaceId?: string): Record<string, string> {
  const headers: Record<string, string> = { authorization: `Bearer ${apiKey}` };
  if (workspaceId) {
    headers['x-workspace-id'] = workspaceId;
  }
  return headers;
}

async function seedOrganization(
  db: MockD1Client,
  org: { id: string; ownerId: string; name: string; slug: string },
): Promise<void> {
  await db.execute(
    `INSERT INTO organizations (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
    [org.id, org.ownerId, org.name, org.slug, new Date().toISOString()],
  );
}

async function seedWorkspace(
  db: MockD1Client,
  workspace: { id: string; ownerId: string; name: string; slug: string },
  organizationId: string,
): Promise<void> {
  await db.execute(
    `INSERT INTO workspaces (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
    [workspace.id, workspace.ownerId, workspace.name, workspace.slug, new Date().toISOString()],
  );
  await db.execute(`UPDATE workspaces SET organization_id = ? WHERE id = ?`, [
    organizationId,
    workspace.id,
  ]);
}

async function seedMembership(
  db: MockD1Client,
  membership: {
    organizationId: string;
    workspaceId: string;
    identityId: string;
    role: string;
  },
): Promise<void> {
  await db.execute(
    `INSERT INTO workspace_memberships (id, organization_id, workspace_id, identity_id, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      membership.organizationId,
      membership.workspaceId,
      membership.identityId,
      membership.role,
      new Date().toISOString(),
    ],
  );
}

describe('Cross-Organization RBAC E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;
  let ownerKey: string;
  let ownerId: string;
  let identityId: string;
  let memoryInOrgAId: string;
  let memoryInOrgBId: string;

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
      payload: { name: 'org-owner', client: { name: 'cursor', type: 'mcp' } },
    });
    const bootstrapBody = bootstrap.json().data;
    ownerKey = bootstrapBody.apiKey as string;
    ownerId = bootstrapBody.owner_id as string;
    identityId = bootstrapBody.identity.id as string;

    await seedOrganization(mockDb, {
      id: ORG_A_ID,
      ownerId,
      name: 'Org A',
      slug: 'org-a',
    });
    await seedOrganization(mockDb, {
      id: ORG_B_ID,
      ownerId,
      name: 'Org B',
      slug: 'org-b',
    });

    await seedWorkspace(
      mockDb,
      { id: WS_A_ID, ownerId, name: 'Workspace A', slug: 'workspace-a' },
      ORG_A_ID,
    );
    await seedWorkspace(
      mockDb,
      { id: WS_B_ID, ownerId, name: 'Workspace B', slug: 'workspace-b' },
      ORG_B_ID,
    );

    await seedMembership(mockDb, {
      organizationId: ORG_A_ID,
      workspaceId: WS_A_ID,
      identityId,
      role: 'member',
    });

    const createA = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey, WS_A_ID),
      payload: {
        title: 'Org A secret',
        content: 'Organization A classified',
        project: 'org-a',
      },
    });
    memoryInOrgAId = createA.json().id as string;

    await seedMembership(mockDb, {
      organizationId: ORG_B_ID,
      workspaceId: WS_B_ID,
      identityId,
      role: 'member',
    });

    const createB = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey, WS_B_ID),
      payload: {
        title: 'Org B secret',
        content: 'Organization B classified',
        project: 'org-b',
      },
    });
    memoryInOrgBId = createB.json().id as string;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('should allow member to read memory in assigned org workspace', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryInOrgAId}`,
      headers: authHeaders(ownerKey, WS_A_ID),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe('Org A secret');
  });

  it('should deny read when identity lacks workspace membership', async () => {
    const outsiderBootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers: authHeaders(ownerKey),
      payload: { type: 'api_key', name: 'outsider' },
    });
    const outsiderKey = outsiderBootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryInOrgAId}`,
      headers: authHeaders(outsiderKey, WS_A_ID),
    });

    expect(response.statusCode).toBe(403);
  });

  it('should deny write when identity lacks workspace membership', async () => {
    const outsiderBootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/identities',
      headers: authHeaders(ownerKey),
      payload: { type: 'api_key', name: 'writer-outsider' },
    });
    const outsiderKey = outsiderBootstrap.json().data.apiKey as string;

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(outsiderKey, WS_A_ID),
      payload: { title: 'Intrusion', content: 'Should fail', project: 'hack' },
    });

    expect(response.statusCode).toBe(403);
  });

  it('should deny cross-org workspace read without membership in target org', async () => {
    mockDb.removeWorkspaceMembership(WS_B_ID, identityId);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryInOrgBId}`,
      headers: authHeaders(ownerKey, WS_B_ID),
    });

    expect(response.statusCode).toBe(403);
  });

  it('should return 404 when reading org A memory with org B workspace scope', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryInOrgAId}`,
      headers: authHeaders(ownerKey, WS_B_ID),
    });

    expect(response.statusCode).toBe(404);
  });

  it('should allow viewer to read but not write', async () => {
    await mockDb.execute(
      `UPDATE workspace_memberships SET role = ? WHERE workspace_id = ? AND identity_id = ?`,
      ['viewer', WS_A_ID, identityId],
    );

    const read = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryInOrgAId}`,
      headers: authHeaders(ownerKey, WS_A_ID),
    });
    expect(read.statusCode).toBe(200);

    const write = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey, WS_A_ID),
      payload: { title: 'Viewer write', content: 'Denied', project: 'org-a' },
    });
    expect(write.statusCode).toBe(403);
  });

  it('should allow member to create memory in assigned workspace', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey, WS_A_ID),
      payload: { title: 'Member create', content: 'Allowed', project: 'org-a' },
    });

    expect(response.statusCode).toBe(201);
  });

  it('should deny PATCH without write permission', async () => {
    await mockDb.execute(
      `UPDATE workspace_memberships SET role = ? WHERE workspace_id = ? AND identity_id = ?`,
      ['viewer', WS_A_ID, identityId],
    );

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/memory/${memoryInOrgAId}`,
      headers: authHeaders(ownerKey, WS_A_ID),
      payload: { title: 'Viewer patch' },
    });

    expect(response.statusCode).toBe(403);
  });

  it('should skip RBAC when X-Workspace-Id header is omitted', async () => {
    const createDefault = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey),
      payload: {
        title: 'Default workspace memory',
        content: 'Accessible without workspace header',
        project: 'rbac-default',
      },
    });
    expect(createDefault.statusCode).toBe(201);
    const defaultMemoryId = createDefault.json().id as string;

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${defaultMemoryId}`,
      headers: authHeaders(ownerKey),
    });

    expect(response.statusCode).toBe(200);
  });

  it('should deny DELETE without write permission', async () => {
    await mockDb.execute(
      `UPDATE workspace_memberships SET role = ? WHERE workspace_id = ? AND identity_id = ?`,
      ['viewer', WS_A_ID, identityId],
    );

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/memory/${memoryInOrgAId}`,
      headers: authHeaders(ownerKey, WS_A_ID),
    });

    expect(response.statusCode).toBe(403);
  });

  it('should isolate org B memory from org A workspace header', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/memory?project=org-b',
      headers: authHeaders(ownerKey, WS_A_ID),
    });

    expect(list.statusCode).toBe(200);
    const ids = (list.json().memories as Array<{ id: string }>).map((item) => item.id);
    expect(ids).not.toContain(memoryInOrgBId);
  });

  it('should allow admin role to write', async () => {
    await mockDb.execute(
      `UPDATE workspace_memberships SET role = ? WHERE workspace_id = ? AND identity_id = ?`,
      ['admin', WS_A_ID, identityId],
    );

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: authHeaders(ownerKey, WS_A_ID),
      payload: { title: 'Admin write', content: 'Allowed', project: 'org-a' },
    });

    expect(response.statusCode).toBe(201);
  });
});
