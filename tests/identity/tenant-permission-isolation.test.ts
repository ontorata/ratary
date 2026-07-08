import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../../src/auth/auth.types.js';
import { evaluatePermissionForRequest } from '../../src/auth/permission-context.js';
import { resolveTenantContext } from '../../src/auth/tenant-context.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { ForbiddenError } from '../../src/types/errors.js';
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

describe('tenant permission isolation (identity foundation wave 3)', () => {
  let db: SqliteMemoryDatabase;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it('denies cross-organization access before memory permission is evaluated', async () => {
    const ownerId = randomUUID();
    const orgA = await createOrganization(db, ownerId, { name: 'Org A', slug: 'org-a' });
    const orgB = await createOrganization(db, ownerId, { name: 'Org B', slug: 'org-b' });
    const workspaceB = await createWorkspace(db, ownerId, {
      organizationId: orgB.id,
      name: 'B Space',
      slug: 'b-space',
    });

    const auth = makeAuthUser(ownerId, ['memory.read', 'memory.write']);

    await expect(
      resolveTenantContext(db, auth, {
        'x-organization-id': orgA.id,
        'x-workspace-id': workspaceB.id,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('returns 403 when permission missing even with valid tenant headers', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.write']);
    const tenant = await resolveTenantContext(db, auth, {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    });

    const enriched = { ...auth, ...tenant };

    expect(() => evaluatePermissionForRequest(enriched, 'GET', '/api/v1/search')).toThrow(
      ForbiddenError,
    );
  });

  it('allows memory.read within correct tenant boundary', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Main',
      slug: 'main',
    });

    const auth = makeAuthUser(ownerId, ['memory.read']);
    const tenant = await resolveTenantContext(db, auth, {
      'x-organization-id': org.id,
      'x-workspace-id': workspace.id,
    });

    const enriched = { ...auth, ...tenant };

    expect(() => evaluatePermissionForRequest(enriched, 'GET', '/api/v1/memory')).not.toThrow();
  });
});
