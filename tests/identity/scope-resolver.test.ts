import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import { attachTenantContextToAuthUser } from '../../src/auth/tenant-context.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { ForbiddenError, TenantContextRequiredError } from '../../src/types/errors.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupIdentityTestDatabase } from './helpers/setup-identity-db.js';

function makeAuthUser(ownerId: string): AuthUser {
  const identityId = randomUUID();
  return {
    ownerId,
    identityId,
    id: identityId,
    identityType: 'jwt',
    clientId: null,
    permissions: ['memory.read', 'memory.write'],
  };
}

describe('scope resolver (identity foundation wave 2)', () => {
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

  it('returns correct tenant scope from identity context', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Scope Org', slug: 'scope-org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Primary',
      slug: 'primary',
    });

    const auth = attachTenantContextToAuthUser(makeAuthUser(ownerId), {
      organizationId: org.id,
      workspaceId: workspace.id,
    });

    const scope = await resolver.resolveFromRequest(auth);
    expect(scope).toEqual({
      ownerId,
      organizationId: org.id,
      workspaceId: workspace.id,
    });
  });

  it('rejects workspace that does not belong to organizationId', async () => {
    const ownerId = randomUUID();
    const orgA = await createOrganization(db, ownerId, { name: 'A', slug: 'a' });
    const orgB = await createOrganization(db, ownerId, { name: 'B', slug: 'b' });
    const workspaceB = await createWorkspace(db, ownerId, {
      organizationId: orgB.id,
      name: 'B only',
      slug: 'b-only',
    });

    const auth = attachTenantContextToAuthUser(makeAuthUser(ownerId), {
      organizationId: orgA.id,
      workspaceId: workspaceB.id,
    });

    await expect(resolver.resolveFromRequest(auth)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects mismatched organization hint vs authenticated tenant', async () => {
    const ownerId = randomUUID();
    const orgA = await createOrganization(db, ownerId, { name: 'A', slug: 'a' });
    const orgB = await createOrganization(db, ownerId, { name: 'B', slug: 'b' });
    const workspaceA = await createWorkspace(db, ownerId, {
      organizationId: orgA.id,
      name: 'A space',
      slug: 'a-space',
    });

    const auth = attachTenantContextToAuthUser(makeAuthUser(ownerId), {
      organizationId: orgA.id,
      workspaceId: workspaceA.id,
    });

    await expect(
      resolver.resolveFromRequest(auth, { organizationId: orgB.id, workspaceId: workspaceA.id }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('does not silently derive default workspace on REST path', async () => {
    const ownerId = randomUUID();
    await createOrganization(db, ownerId, { name: 'Only Org', slug: 'only-org' });

    await expect(resolver.resolveFromRequest(makeAuthUser(ownerId))).rejects.toBeInstanceOf(
      TenantContextRequiredError,
    );
  });
});
