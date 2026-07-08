import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  authorizeMcpRemoteSession,
  resolveAuthorizedTenantContext,
} from '../../src/auth/authorization-boundary.js';
import { makeAuthUser } from './helpers/auth-user.js';
import { createOrganization } from '../../src/scope/organization-store.js';
import { createWorkspace } from '../../src/scope/workspace-store.js';
import { TenantContextRequiredError } from '../../src/types/errors.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupIdentityTestDatabase } from './helpers/setup-identity-db.js';

describe('tenant isolation REST MCP (identity foundation wave 4)', () => {
  let db: SqliteMemoryDatabase;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it('denies REST tenant resolution without workspace header', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const auth = makeAuthUser(ownerId, ['memory.read']);

    await expect(
      resolveAuthorizedTenantContext(db, auth, { 'x-organization-id': org.id }, 'REST'),
    ).rejects.toBeInstanceOf(TenantContextRequiredError);
  });

  it('denies MCP tenant resolution without workspace header', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Org', slug: 'org' });
    const auth = makeAuthUser(ownerId, ['memory.read']);

    await expect(
      authorizeMcpRemoteSession(db, auth, { 'x-organization-id': org.id }),
    ).rejects.toBeInstanceOf(TenantContextRequiredError);
  });

  it('denies cross-organization access consistently for REST and MCP', async () => {
    const ownerId = randomUUID();
    const orgA = await createOrganization(db, ownerId, { name: 'Org A', slug: 'org-a' });
    const orgB = await createOrganization(db, ownerId, { name: 'Org B', slug: 'org-b' });
    const workspaceB = await createWorkspace(db, ownerId, {
      organizationId: orgB.id,
      name: 'B Space',
      slug: 'b-space',
    });

    const auth = makeAuthUser(ownerId, ['memory.read', 'memory.write']);
    const headers = {
      'x-organization-id': orgA.id,
      'x-workspace-id': workspaceB.id,
    };

    await expect(resolveAuthorizedTenantContext(db, auth, headers, 'REST')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    await expect(authorizeMcpRemoteSession(db, auth, headers)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
