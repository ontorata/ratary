import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import {
  attachTenantContextToAuthUser,
  resolveTenantContext,
} from '../../src/auth/tenant-context.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { TenantContextRequiredError } from '../../src/types/errors.js';
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

describe('auth context integration (identity foundation wave 2)', () => {
  let db: SqliteMemoryDatabase;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it('resolves tenant context for authenticated user with org/workspace headers', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Tenant', slug: 'tenant' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId);
    const tenant = await resolveTenantContext(db, auth, {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    });

    const enriched = attachTenantContextToAuthUser(auth, tenant);
    expect(enriched.organizationId).toBe(org.id);
    expect(enriched.workspaceId).toBe(workspace.id);
    expect(enriched.id).toBe(enriched.identityId);
  });

  it('fails when organization header is missing', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Tenant', slug: 'tenant' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    await expect(
      resolveTenantContext(db, makeAuthUser(ownerId), {
        'x-workspace-id': workspace.id,
      }),
    ).rejects.toBeInstanceOf(TenantContextRequiredError);
  });

  it('fails when workspace header is missing', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Tenant', slug: 'tenant' });

    await expect(
      resolveTenantContext(db, makeAuthUser(ownerId), {
        'x-organization-id': org.id,
      }),
    ).rejects.toBeInstanceOf(TenantContextRequiredError);
  });

  it('fails when user from org A accesses workspace in org B', async () => {
    const ownerId = randomUUID();
    const orgA = await createOrganization(db, ownerId, { name: 'Org A', slug: 'org-a' });
    const orgB = await createOrganization(db, ownerId, { name: 'Org B', slug: 'org-b' });
    const workspaceB = await createWorkspace(db, ownerId, {
      organizationId: orgB.id,
      name: 'B Space',
      slug: 'b-space',
    });

    await expect(
      resolveTenantContext(db, makeAuthUser(ownerId), {
        'x-organization-id': orgA.id,
        'x-workspace-id': workspaceB.id,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('scope resolver receives tenant context from enriched AuthUser', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Tenant', slug: 'tenant' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = attachTenantContextToAuthUser(makeAuthUser(ownerId), {
      organizationId: org.id,
      workspaceId: workspace.id,
    });

    const resolver = new DefaultScopeResolver(db);
    const scope = await resolver.resolveFromRequest(auth);

    expect(scope.organizationId).toBe(org.id);
    expect(scope.workspaceId).toBe(workspace.id);
    expect(scope.ownerId).toBe(ownerId);
  });

  it('scope resolver rejects missing tenant context on AuthUser', async () => {
    const resolver = new DefaultScopeResolver(db);
    await expect(resolver.resolveFromRequest(makeAuthUser(randomUUID()))).rejects.toBeInstanceOf(
      TenantContextRequiredError,
    );
  });
});
