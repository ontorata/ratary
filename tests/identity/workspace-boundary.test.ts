import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createOrganization, countOrphanWorkspaces } from '../../src/scope/organization-store.js';
import {
  createWorkspace,
  ensureDefaultWorkspace,
  findWorkspaceById,
  listWorkspacesByOwner,
} from '../../src/scope/workspace-store.js';
import { TenantContextRequiredError } from '../../src/types/errors.js';
import { migrateIdentityFoundationPhase1 } from '../../src/db/migrations.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupIdentityTestDatabase } from './helpers/setup-identity-db.js';

describe('workspace boundary (identity foundation wave 1)', () => {
  let db: SqliteMemoryDatabase;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it('creates workspace when organizationId is provided', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Tenant Org', slug: 'tenant' });

    const workspace = await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Engineering',
      slug: 'engineering',
    });

    expect(workspace.organizationId).toBe(org.id);
    expect(await countOrphanWorkspaces(db)).toBe(0);
  });

  it('fails to create workspace without organizationId', async () => {
    const ownerId = randomUUID();

    await expect(
      createWorkspace(db, ownerId, {
        organizationId: '',
        name: 'Invalid',
      }),
    ).rejects.toBeInstanceOf(TenantContextRequiredError);
  });

  it('fails to create workspace for organization not owned by caller', async () => {
    const ownerA = randomUUID();
    const ownerB = randomUUID();
    const orgB = await createOrganization(db, ownerB, { name: 'B Org', slug: 'b-org' });

    await expect(
      createWorkspace(db, ownerA, {
        organizationId: orgB.id,
        name: 'Cross Owner',
        slug: 'cross-owner',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('ensureDefaultWorkspace binds bootstrap workspace to default organization', async () => {
    const ownerId = randomUUID();
    const { workspace, created } = await ensureDefaultWorkspace(db, ownerId);

    expect(created).toBe(true);
    expect(workspace.organizationId).toBeTruthy();
    expect(await countOrphanWorkspaces(db)).toBe(0);
  });

  it('supports multi-workspace under same organization', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Multi Org', slug: 'multi' });

    await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Alpha',
      slug: 'alpha',
    });
    await createWorkspace(db, ownerId, {
      organizationId: org.id,
      name: 'Beta',
      slug: 'beta',
    });

    const workspaces = await listWorkspacesByOwner(db, ownerId, { organizationId: org.id });
    expect(workspaces).toHaveLength(2);
  });

  it('fails cross-organization workspace lookup for same owner', async () => {
    const ownerId = randomUUID();
    const orgA = await createOrganization(db, ownerId, { name: 'Org A', slug: 'org-a' });
    const orgB = await createOrganization(db, ownerId, { name: 'Org B', slug: 'org-b' });

    const workspace = await createWorkspace(db, ownerId, {
      organizationId: orgA.id,
      name: 'Scoped',
      slug: 'scoped',
    });

    const wrongOrgLookup = await findWorkspaceById(db, ownerId, workspace.id, {
      organizationId: orgB.id,
    });
    expect(wrongOrgLookup).toBeNull();

    const correctLookup = await findWorkspaceById(db, ownerId, workspace.id, {
      organizationId: orgA.id,
    });
    expect(correctLookup?.id).toBe(workspace.id);
  });

  it('migration backfill removes orphan workspaces', async () => {
    const ownerId = randomUUID();
    const workspaceId = randomUUID();

    await db.execute(
      `INSERT INTO workspaces (id, owner_id, name, slug, created_at, organization_id)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [workspaceId, ownerId, 'Legacy', 'legacy', new Date().toISOString()],
    );

    expect(await countOrphanWorkspaces(db)).toBe(1);

    await migrateIdentityFoundationPhase1(db, 'sqlite');

    expect(await countOrphanWorkspaces(db)).toBe(0);
    const rebound = await findWorkspaceById(db, ownerId, workspaceId);
    expect(rebound?.organizationId).toBeTruthy();
  });
});
