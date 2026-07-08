import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import {
  assertMcpRemoteHandlerPermission,
  authorizeMcpRemoteSession,
} from '../../src/auth/authorization-boundary.js';
import { PERMISSIONS } from '../../src/auth/permission-context.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { resolveHandlerScope } from '../../src/transport/shared/handlers/resolve-handler-scope.js';
import type { TransportContext } from '../../src/transport/shared/transport-context.types.js';
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

describe('MCP scope recall (identity foundation wave 4)', () => {
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

  it('resolves scoped memory context for MCP remote after tenant authorization', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.read']);
    const enriched = await authorizeMcpRemoteSession(db, auth, {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    });

    const ctx: TransportContext = {
      requestId: randomUUID(),
      ownerId,
      organizationId: org.id,
      workspaceId: workspace.id,
      auth: enriched,
      source: 'mcp-remote',
    };

    const scope = await resolveHandlerScope(ctx, resolver, PERMISSIONS.MEMORY_READ);

    expect(scope).toEqual({
      ownerId,
      organizationId: org.id,
      workspaceId: workspace.id,
    });
  });

  it('denies MCP recall when memory.read permission is missing', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.write']);
    const enriched = await authorizeMcpRemoteSession(db, auth, {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    });

    expect(() => assertMcpRemoteHandlerPermission(enriched, PERMISSIONS.MEMORY_READ)).toThrow(
      ForbiddenError,
    );
  });

  it('denies MCP handler scope when tenant context was never authorized', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.read']);

    const ctx: TransportContext = {
      requestId: randomUUID(),
      ownerId,
      organizationId: org.id,
      workspaceId: workspace.id,
      auth,
      source: 'mcp-remote',
    };

    await expect(
      resolveHandlerScope(ctx, resolver, PERMISSIONS.MEMORY_READ),
    ).rejects.toBeInstanceOf(TenantContextRequiredError);
  });
});
