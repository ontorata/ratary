import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import {
  assertMcpRemoteHandlerPermission,
  authorizeMcpRemoteSession,
  evaluateRestAuthorization,
  formatMcpAuthorizationError,
  resetAuthorizationAuditSink,
  setAuthorizationAuditSink,
  type AuthorizationAuditRecord,
} from '../../src/auth/authorization-boundary.js';
import { PERMISSIONS } from '../../src/auth/permission-context.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { ForbiddenError, TenantContextRequiredError } from '../../src/types/errors.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupIdentityTestDatabase } from './helpers/setup-identity-db.js';

function makeAuthUser(ownerId: string, permissions: string[]): AuthUser {
  const identityId = randomUUID();
  return {
    ownerId,
    identityId,
    id: identityId,
    identityType: 'api_key',
    clientId: null,
    permissions,
  };
}

describe('authorization boundary (identity foundation wave 4)', () => {
  let db: SqliteMemoryDatabase;
  let auditRecords: AuthorizationAuditRecord[];

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
    auditRecords = [];
    setAuthorizationAuditSink((record) => auditRecords.push(record));
  });

  afterEach(() => {
    resetAuthorizationAuditSink();
    db.close();
  });

  it('records transport metadata on REST allow', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth: AuthUser = {
      ...makeAuthUser(randomUUID(), ['memory.read']),
      ...tenant,
    };

    evaluateRestAuthorization(auth, 'GET', '/api/v1/search');

    expect(auditRecords).toContainEqual(
      expect.objectContaining({
        transport: 'REST',
        identityId: auth.identityId,
        organizationId: tenant.organizationId,
        workspaceId: tenant.workspaceId,
        permission: PERMISSIONS.MEMORY_READ,
        decision: 'allow',
      }),
    );
  });

  it('records transport metadata on REST deny', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth: AuthUser = {
      ...makeAuthUser(randomUUID(), ['memory.write']),
      ...tenant,
    };

    expect(() => evaluateRestAuthorization(auth, 'GET', '/api/v1/search')).toThrow(ForbiddenError);

    expect(auditRecords).toContainEqual(
      expect.objectContaining({
        transport: 'REST',
        permission: PERMISSIONS.MEMORY_READ,
        decision: 'deny',
        reason: 'permission_denied',
      }),
    );
  });

  it('requires tenant headers for MCP remote session authorization', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.read']);

    await expect(authorizeMcpRemoteSession(db, auth, {})).rejects.toBeInstanceOf(
      TenantContextRequiredError,
    );

    expect(auditRecords).toContainEqual(
      expect.objectContaining({
        transport: 'MCP',
        decision: 'deny',
      }),
    );
  });

  it('authorizes MCP remote session with same tenant context as REST', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.read', 'memory.write']);
    const headers = {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    };

    const mcpAuth = await authorizeMcpRemoteSession(db, auth, headers);

    expect(mcpAuth.identityId).toBe(auth.identityId);
    expect(mcpAuth.organizationId).toBe(org.id);
    expect(mcpAuth.workspaceId).toBe(workspace.id);
  });

  it('denies MCP handler permission with audit record', () => {
    const tenant = { organizationId: randomUUID(), workspaceId: randomUUID() };
    const auth: AuthUser = {
      ...makeAuthUser(randomUUID(), ['memory.write']),
      ...tenant,
    };

    expect(() => assertMcpRemoteHandlerPermission(auth, PERMISSIONS.MEMORY_READ)).toThrow(
      ForbiddenError,
    );

    expect(auditRecords).toContainEqual(
      expect.objectContaining({
        transport: 'MCP',
        permission: PERMISSIONS.MEMORY_READ,
        decision: 'deny',
        reason: 'permission_denied',
      }),
    );
  });

  it('formats MCP forbidden errors with parity contract', () => {
    const formatted = formatMcpAuthorizationError(new ForbiddenError());
    expect(formatted.status).toBe(403);
    expect(formatted.body).toEqual({ code: 'FORBIDDEN', reason: 'permission_denied' });
  });
});
