import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/transport/rest/rest-server.js';
import { resetPostgresSqlDatabase, setPostgresSqlDatabase } from '../../src/db/postgres-client.js';
import { resetEnvCache } from '../../src/config/env.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupStudioE2eDatabase } from './helpers/setup-studio-e2e-db.js';
import {
  buildStudioDataPlaneHeaders,
  resolveStudioTenantFromSession,
  toStudioSessionContext,
} from './helpers/studio-session-client.js';

const TEST_AUTH_SECRET = 'test-auth-secret-32-characters-min!!';

interface AuthSuccessBody {
  success: boolean;
  data: {
    accessToken: string;
    identityId: string;
    ownerId: string;
    organizationId: string;
    workspaceId: string;
    email: string;
  };
}

describe('studio identity e2e (identity foundation wave 5)', () => {
  let db: SqliteMemoryDatabase;
  let app: FastifyInstance;

  beforeEach(async () => {
    resetEnvCache();
    resetPostgresSqlDatabase();
    process.env.NODE_ENV = 'test';
    process.env.NATIVE_AUTH_ENABLED = 'true';
    process.env.AUTH_SECRET = TEST_AUTH_SECRET;
    process.env.SQL_PROVIDER = 'postgres';
    process.env.DATABASE_URL = 'postgres://127.0.0.1:5432/ratary_identity_e2e';
    process.env.REMOTE_MCP_ENABLED = 'true';
    process.env.REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED = 'true';
    process.env.REMOTE_MCP_PATH = '/mcp';

    db = new SqliteMemoryDatabase();
    await setupStudioE2eDatabase(db);
    setPostgresSqlDatabase(db);
    app = await buildApp({ logger: false, skipSwagger: true });
  });

  afterEach(async () => {
    await app.close();
    resetPostgresSqlDatabase();
    resetEnvCache();
  });

  afterAll(() => {
    db?.close();
  });

  async function registerStudioUser(): Promise<ReturnType<typeof toStudioSessionContext>> {
    const email = `studio-${randomUUID()}@ontorata.test`;
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email,
        password: 'password12345',
        display_name: 'Studio User',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<AuthSuccessBody>();
    expect(body.success).toBe(true);
    expect(body.data.organizationId).toBeTruthy();
    expect(body.data.workspaceId).toBeTruthy();
    expect(body.data.identityId).toBeTruthy();

    return toStudioSessionContext(body.data);
  }

  it('I6 — session creation includes identity + tenant context from register', async () => {
    const session = await registerStudioUser();
    expect(session.identityId).toBeTruthy();
    expect(session.organizationId).toBeTruthy();
    expect(session.workspaceId).toBeTruthy();
  });

  it('propagates Studio tenant headers for REST memory write + search (session path)', async () => {
    const session = await registerStudioUser();
    const headers = buildStudioDataPlaneHeaders(session);

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers,
      payload: {
        title: 'Studio E2E Memory',
        content: 'Wave 5 identity propagation proof',
        project: 'identity-foundation',
      },
    });
    expect(createResponse.statusCode).toBe(201);

    const searchResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/search?q=Studio',
      headers,
    });
    expect(searchResponse.statusCode).toBe(200);
    const searchBody = searchResponse.json<{ memories?: unknown[]; total?: number }>();
    expect(searchBody.total).toBeGreaterThan(0);
    expect(Array.isArray(searchBody.memories)).toBe(true);
    expect(searchBody.memories!.length).toBeGreaterThan(0);
  });

  it('denies REST data-plane when organization header is missing', async () => {
    const session = await registerStudioUser();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/memory',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'X-Workspace-Id': session.workspaceId,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('denies cross-organization workspace access consistently', async () => {
    const session = await registerStudioUser();
    const orgB = await createOrganization(db, session.ownerId, { name: 'Org B', slug: 'org-b' });
    const workspaceB = await createWorkspace(db, session.ownerId, {
      organizationId: orgB.id,
      name: 'B Space',
      slug: 'b-space',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/search?q=test',
      headers: buildStudioDataPlaneHeaders({
        ...session,
        organizationId: session.organizationId,
        workspaceId: workspaceB.id,
      }),
    });

    expect(response.statusCode).toBe(404);
  });

  it('MCP remote denies session without workspace header (parity with REST)', async () => {
    const session = await registerStudioUser();

    const response = await app.inject({
      method: 'POST',
      url: '/mcp',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'X-Organization-Id': session.organizationId,
        'Content-Type': 'application/json',
      },
      payload: {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'studio-e2e', version: '1.0.0' },
        },
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: 'TENANT_CONTEXT_REQUIRED',
      reason: 'tenant_context_required',
    });
  });

  it('route workspace switch preserves identity + organization (Studio client model)', async () => {
    const session = await registerStudioUser();
    const org = await createOrganization(db, session.ownerId, {
      name: 'Primary Org',
      slug: 'primary-org',
    });
    const altWorkspace = await createWorkspace(db, session.ownerId, {
      organizationId: org.id,
      name: 'Alt',
      slug: 'alt',
    });

    const routeTenant = resolveStudioTenantFromSession(session, altWorkspace.id);
    expect(routeTenant.identityId).toBe(session.identityId);
    expect(routeTenant.organizationId).toBe(session.organizationId);
    expect(routeTenant.workspaceId).toBe(altWorkspace.id);
  });

  it('login refresh preserves tenant context in auth response', async () => {
    const email = `studio-${randomUUID()}@ontorata.test`;
    const password = 'password12345';

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email, password, display_name: 'Studio User' },
    });
    const registered = registerResponse.json<AuthSuccessBody>().data;

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });

    expect(loginResponse.statusCode).toBe(200);
    const loggedIn = loginResponse.json<AuthSuccessBody>().data;
    expect(loggedIn.identityId).toBe(registered.identityId);
    expect(loggedIn.organizationId).toBe(registered.organizationId);
    expect(loggedIn.workspaceId).toBe(registered.workspaceId);
  });
});
