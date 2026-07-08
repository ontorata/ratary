import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createOrganization,
  deleteOrganization,
  ensureDefaultOrganization,
  findOrganizationById,
  findOrganizationBySlug,
  listOrganizationsByOwner,
  organizationExistsForOwner,
} from '../../src/scope/organization-store.js';
import { SqliteMemoryDatabase } from './helpers/sqlite-memory-db.js';
import { setupIdentityTestDatabase } from './helpers/setup-identity-db.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';

describe('organization isolation (identity foundation wave 1)', () => {
  let db: SqliteMemoryDatabase;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await setupIdentityTestDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it('creates an organization and finds it by id and slug', async () => {
    const ownerId = randomUUID();
    const created = await createOrganization(db, ownerId, {
      name: 'Ontorata',
      slug: 'ontorata',
    });

    expect(created.ownerId).toBe(ownerId);

    const byId = await findOrganizationById(db, ownerId, created.id);
    expect(byId?.slug).toBe('ontorata');

    const bySlug = await findOrganizationBySlug(db, ownerId, 'ontorata');
    expect(bySlug?.id).toBe(created.id);
  });

  it('lists organizations scoped to owner', async () => {
    const ownerA = randomUUID();
    const ownerB = randomUUID();

    await createOrganization(db, ownerA, { name: 'Org A', slug: 'org-a' });
    await createOrganization(db, ownerB, { name: 'Org B', slug: 'org-b' });

    const listA = await listOrganizationsByOwner(db, ownerA);
    expect(listA).toHaveLength(1);
    expect(listA[0]?.slug).toBe('org-a');
  });

  it('checks organization existence for owner binding', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Bound Org', slug: 'bound' });

    expect(await organizationExistsForOwner(db, ownerId, org.id)).toBe(true);
    expect(await organizationExistsForOwner(db, randomUUID(), org.id)).toBe(false);
  });

  it('ensureDefaultOrganization is idempotent bootstrap', async () => {
    const ownerId = randomUUID();
    const first = await ensureDefaultOrganization(db, ownerId);
    const second = await ensureDefaultOrganization(db, ownerId);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(first.organization.id).toBe(second.organization.id);
  });

  it('prevents deleting organization while workspaces exist', async () => {
    const ownerId = randomUUID();
    const { organization } = await ensureDefaultOrganization(db, ownerId);

    await db.execute(
      `INSERT INTO workspaces (id, owner_id, name, slug, created_at, organization_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), ownerId, 'Team', 'team', new Date().toISOString(), organization.id],
    );

    await expect(deleteOrganization(db, ownerId, organization.id)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('allows deleting empty organization', async () => {
    const ownerId = randomUUID();
    const org = await createOrganization(db, ownerId, { name: 'Empty Org', slug: 'empty' });

    await deleteOrganization(db, ownerId, org.id);
    expect(await findOrganizationById(db, ownerId, org.id)).toBeNull();
  });
});

describe('organization isolation across owners', () => {
  let db: ISqlDatabase;

  beforeEach(async () => {
    const sqlite = new SqliteMemoryDatabase();
    db = sqlite;
    await setupIdentityTestDatabase(db);
  });

  it('does not expose organization id across owners', async () => {
    const ownerA = randomUUID();
    const ownerB = randomUUID();
    const orgA = await createOrganization(db, ownerA, { name: 'A', slug: 'a' });

    expect(await findOrganizationById(db, ownerB, orgA.id)).toBeNull();
  });
});
