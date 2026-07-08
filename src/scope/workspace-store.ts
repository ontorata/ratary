import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { slugify } from '../knowledge/slug.generator.js';
import { NotFoundError, TenantContextRequiredError, ValidationError } from '../types/errors.js';
import {
  ensureDefaultOrganization,
  findOrganizationById,
  organizationExistsForOwner,
} from './organization-store.js';

export const DEFAULT_WORKSPACE_SLUG = 'default';
export const DEFAULT_WORKSPACE_NAME = 'Default';

export interface WorkspaceRecord {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: string;
  organizationId: string;
}

interface WorkspaceRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
  organization_id?: string | null;
}

function mapWorkspaceRowOrNull(row: WorkspaceRow): WorkspaceRecord | null {
  const organizationId = row.organization_id?.trim();
  if (!organizationId) {
    return null;
  }

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    organizationId,
  };
}

export async function findWorkspaceBySlug(
  client: ISqlDatabase,
  ownerId: string,
  slug: string,
  options?: { organizationId?: string },
): Promise<WorkspaceRecord | null> {
  const rows = await client.query<WorkspaceRow>(
    `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE owner_id = ? AND slug = ?`,
    [ownerId, slug],
  );

  const workspace = rows[0] ? mapWorkspaceRowOrNull(rows[0]) : null;
  if (!workspace) {
    return null;
  }

  if (options?.organizationId && workspace.organizationId !== options.organizationId) {
    return null;
  }

  return workspace;
}

export async function listWorkspacesByOwner(
  client: ISqlDatabase,
  ownerId: string,
  options?: { organizationId?: string },
): Promise<WorkspaceRecord[]> {
  const params: unknown[] = [ownerId];
  let sql = `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE owner_id = ?`;

  if (options?.organizationId) {
    sql += ' AND organization_id = ?';
    params.push(options.organizationId);
  }

  sql += ' ORDER BY created_at ASC';

  const rows = await client.query<WorkspaceRow>(sql, params);

  return rows
    .map((row) => mapWorkspaceRowOrNull(row))
    .filter((workspace): workspace is WorkspaceRecord => workspace !== null);
}

export interface CreateWorkspaceInput {
  organizationId: string;
  name: string;
  slug?: string;
}

export async function createWorkspace(
  client: ISqlDatabase,
  ownerId: string,
  input: CreateWorkspaceInput,
  now: () => string = () => new Date().toISOString(),
): Promise<WorkspaceRecord> {
  const organizationId = input.organizationId?.trim();
  if (!organizationId) {
    throw new TenantContextRequiredError('organizationId is required to create a workspace');
  }

  const orgExists = await organizationExistsForOwner(client, ownerId, organizationId);
  if (!orgExists) {
    throw new NotFoundError('Organization', organizationId);
  }

  const name = input.name.trim();
  if (!name) {
    throw new ValidationError('Workspace name is required');
  }

  const slug = (input.slug?.trim() || slugify(name)).toLowerCase();
  if (!slug) {
    throw new ValidationError('Workspace slug is required');
  }

  if (slug === DEFAULT_WORKSPACE_SLUG) {
    throw new ValidationError(`Workspace slug '${DEFAULT_WORKSPACE_SLUG}' is reserved`);
  }

  const existingSlug = await findWorkspaceBySlug(client, ownerId, slug, { organizationId });
  if (existingSlug) {
    throw new ValidationError(`Workspace slug '${slug}' already exists`);
  }

  const workspace: WorkspaceRecord = {
    id: randomUUID(),
    ownerId,
    name,
    slug,
    createdAt: now(),
    organizationId,
  };

  await client.execute(
    `INSERT INTO workspaces (id, owner_id, name, slug, created_at, organization_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      workspace.id,
      workspace.ownerId,
      workspace.name,
      workspace.slug,
      workspace.createdAt,
      workspace.organizationId,
    ],
  );

  return workspace;
}

export async function findWorkspaceById(
  client: ISqlDatabase,
  ownerId: string,
  workspaceId: string,
  options?: { organizationId?: string },
): Promise<WorkspaceRecord | null> {
  const rows = await client.query<WorkspaceRow>(
    `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE id = ? AND owner_id = ?`,
    [workspaceId, ownerId],
  );

  const workspace = rows[0] ? mapWorkspaceRowOrNull(rows[0]) : null;
  if (!workspace) {
    return null;
  }

  if (options?.organizationId && workspace.organizationId !== options.organizationId) {
    return null;
  }

  return workspace;
}

export async function findDefaultWorkspace(
  client: ISqlDatabase,
  ownerId: string,
): Promise<WorkspaceRecord | null> {
  return findWorkspaceBySlug(client, ownerId, DEFAULT_WORKSPACE_SLUG);
}

/**
 * Bootstrap path: ensures default organization + default workspace (idempotent).
 * Not for arbitrary production workspace creation without organizationId.
 */
export async function ensureDefaultWorkspace(
  client: ISqlDatabase,
  ownerId: string,
  now: () => string = () => new Date().toISOString(),
): Promise<{ workspace: WorkspaceRecord; created: boolean }> {
  const { organization } = await ensureDefaultOrganization(client, ownerId, now);

  const existing = await findDefaultWorkspace(client, ownerId);
  if (existing) {
    if (existing.organizationId !== organization.id) {
      await client.execute(
        `UPDATE workspaces SET organization_id = ? WHERE id = ? AND owner_id = ?`,
        [organization.id, existing.id, ownerId],
      );
      return {
        workspace: { ...existing, organizationId: organization.id },
        created: false,
      };
    }
    return { workspace: existing, created: false };
  }

  const workspace: WorkspaceRecord = {
    id: randomUUID(),
    ownerId,
    name: DEFAULT_WORKSPACE_NAME,
    slug: DEFAULT_WORKSPACE_SLUG,
    createdAt: now(),
    organizationId: organization.id,
  };

  await client.execute(
    `INSERT INTO workspaces (id, owner_id, name, slug, created_at, organization_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      workspace.id,
      workspace.ownerId,
      workspace.name,
      workspace.slug,
      workspace.createdAt,
      workspace.organizationId,
    ],
  );

  return { workspace, created: true };
}

export async function requireOrganizationForOwner(
  client: ISqlDatabase,
  ownerId: string,
  organizationId: string,
): Promise<void> {
  const org = await findOrganizationById(client, ownerId, organizationId);
  if (!org) {
    throw new NotFoundError('Organization', organizationId);
  }
}
