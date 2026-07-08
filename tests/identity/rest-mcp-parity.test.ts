import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import {
  authorizeMcpRemoteSession,
  evaluateRestAuthorization,
  resolveAuthorizedTenantContext,
} from '../../src/auth/authorization-boundary.js';
import { resolvePermissionContext } from '../../src/auth/permission-context.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import {
  buildTransportContextFromRestRequest,
  resolveMemoryScopeFromTransportContext,
} from '../../src/transport/shared/resolve-transport-scope.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupIdentityTestDatabase } from './helpers/setup-identity-db.js';

function makeAuthUser(ownerId: string): AuthUser {
  const identityId = randomUUID();
  return {
    ownerId,
    identityId,
    id: identityId,
    identityType: 'api_key',
    clientId: null,
    permissions: ['memory.read', 'memory.write'],
  };
}

describe('REST MCP parity (identity foundation wave 4)', () => {
  let db: SqliteMemoryDatabase;
  let resolver: DefaultScopeResolver;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
    resolver = new DefaultScopeResolver(db);
  });

  afterEach(() => {
    db.close();
  });

  it('produces identical PermissionContext for REST and MCP with same tenant headers', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId);
    const headers = {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    };

    const restAuth = await resolveAuthorizedTenantContext(db, auth, headers, 'REST');
    evaluateRestAuthorization(restAuth, 'GET', '/api/v1/search');

    const mcpAuth = await authorizeMcpRemoteSession(db, auth, headers);

    const restCtx = resolvePermissionContext(restAuth);
    const mcpCtx = resolvePermissionContext(mcpAuth);

    expect(mcpCtx).toEqual(restCtx);
    expect(mcpCtx.identityId).toBe(auth.identityId);
    expect(mcpCtx.organizationId).toBe(org.id);
    expect(mcpCtx.workspaceId).toBe(workspace.id);
  });

  it('produces identical MemoryScope for REST and MCP transport contexts', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId);
    const headers = {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    };

    const enriched = await authorizeMcpRemoteSession(db, auth, headers);

    const restTransport = buildTransportContextFromRestRequest({
      id: 'req-rest',
      ip: '127.0.0.1',
      headers,
      user: enriched,
    } as never);

    const mcpTransport = {
      ...restTransport,
      source: 'mcp-remote' as const,
      auth: enriched,
      organizationId: enriched.organizationId,
      workspaceId: enriched.workspaceId,
    };

    const restScope = await resolveMemoryScopeFromTransportContext(restTransport, resolver);
    const mcpScope = await resolveMemoryScopeFromTransportContext(mcpTransport, resolver);

    expect(mcpScope).toEqual(restScope);
    expect(mcpScope).toEqual({
      ownerId,
      organizationId: org.id,
      workspaceId: workspace.id,
    });
  });
});
