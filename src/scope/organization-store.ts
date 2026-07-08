import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { slugify } from '../knowledge/slug.generator.js';
import { NotFoundError, ValidationError } from '../types/errors.js';

export const DEFAULT_ORGANIZATION_SLUG = 'default';
export const DEFAULT_ORGANIZATION_NAME = 'Default Organization';

export interface OrganizationRecord {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface OrganizationRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
}

function mapOrganizationRow(row: OrganizationRow): OrganizationRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

export async function findOrganizationById(
  client: ISqlDatabase,
  ownerId: string,
  organizationId: string,
): Promise<OrganizationRecord | null> {
  const rows = await client.query<OrganizationRow>(
    `SELECT id, owner_id, name, slug, created_at
     FROM organizations
     WHERE id = ? AND owner_id = ?`,
    [organizationId, ownerId],
  );

  return rows[0] ? mapOrganizationRow(rows[0]) : null;
}

export async function findOrganizationBySlug(
  client: ISqlDatabase,
  ownerId: string,
  slug: string,
): Promise<OrganizationRecord | null> {
  const rows = await client.query<OrganizationRow>(
    `SELECT id, owner_id, name, slug, created_at
     FROM organizations
     WHERE owner_id = ? AND slug = ?`,
    [ownerId, slug],
  );

  return rows[0] ? mapOrganizationRow(rows[0]) : null;
}

export async function listOrganizationsByOwner(
  client: ISqlDatabase,
  ownerId: string,
): Promise<OrganizationRecord[]> {
  const rows = await client.query<OrganizationRow>(
    `SELECT id, owner_id, name, slug, created_at
     FROM organizations
     WHERE owner_id = ?
     ORDER BY created_at ASC`,
    [ownerId],
  );

  return rows.map(mapOrganizationRow);
}

export async function organizationExistsForOwner(
  client: ISqlDatabase,
  ownerId: string,
  organizationId: string,
): Promise<boolean> {
  const org = await findOrganizationById(client, ownerId, organizationId);
  return org !== null;
}

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
}

export async function createOrganization(
  client: ISqlDatabase,
  ownerId: string,
  input: CreateOrganizationInput,
  now: () => string = () => new Date().toISOString(),
): Promise<OrganizationRecord> {
  const name = input.name.trim();
  if (!name) {
    throw new ValidationError('Organization name is required');
  }

  const slug = (input.slug?.trim() || slugify(name)).toLowerCase();
  if (!slug) {
    throw new ValidationError('Organization slug is required');
  }

  const existingSlug = await findOrganizationBySlug(client, ownerId, slug);
  if (existingSlug) {
    throw new ValidationError(`Organization slug '${slug}' already exists`);
  }

  const organization: OrganizationRecord = {
    id: randomUUID(),
    ownerId,
    name,
    slug,
    createdAt: now(),
  };

  await client.execute(
    `INSERT INTO organizations (id, owner_id, name, slug, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [organization.id, organization.ownerId, organization.name, organization.slug, organization.createdAt],
  );

  return organization;
}

/**
 * Bootstrap path: ensures every owner has a default organization (idempotent).
 */
export async function ensureDefaultOrganization(
  client: ISqlDatabase,
  ownerId: string,
  now: () => string = () => new Date().toISOString(),
): Promise<{ organization: OrganizationRecord; created: boolean }> {
  const existing = await findOrganizationBySlug(client, ownerId, DEFAULT_ORGANIZATION_SLUG);
  if (existing) {
    return { organization: existing, created: false };
  }

  const organization = await createOrganization(
    client,
    ownerId,
    { name: DEFAULT_ORGANIZATION_NAME, slug: DEFAULT_ORGANIZATION_SLUG },
    now,
  );

  return { organization, created: true };
}

export async function countWorkspacesInOrganization(
  client: ISqlDatabase,
  organizationId: string,
): Promise<number> {
  const rows = await client.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM workspaces WHERE organization_id = ?`,
    [organizationId],
  );
  return rows[0]?.count ?? 0;
}

/**
 * Deletes an organization only when it has no workspaces (controlled behavior).
 */
export async function deleteOrganization(
  client: ISqlDatabase,
  ownerId: string,
  organizationId: string,
): Promise<void> {
  const org = await findOrganizationById(client, ownerId, organizationId);
  if (!org) {
    throw new NotFoundError('Organization', organizationId);
  }

  const workspaceCount = await countWorkspacesInOrganization(client, organizationId);
  if (workspaceCount > 0) {
    throw new ValidationError(
      `Cannot delete organization with ${workspaceCount} workspace(s). Remove workspaces first.`,
    );
  }

  await client.execute(`DELETE FROM organizations WHERE id = ? AND owner_id = ?`, [
    organizationId,
    ownerId,
  ]);
}

export async function countOrphanWorkspaces(client: ISqlDatabase): Promise<number> {
  const rows = await client.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM workspaces WHERE organization_id IS NULL OR organization_id = ''`,
  );
  return rows[0]?.count ?? 0;
}
