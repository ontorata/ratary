import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { slugify } from '../knowledge/slug.generator.js';
import { ValidationError } from '../types/errors.js';

export const DEFAULT_WORKSPACE_SLUG = 'default';
export const DEFAULT_WORKSPACE_NAME = 'Default';

export interface WorkspaceRecord {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: string;
  organizationId?: string;
}

interface WorkspaceRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
  organization_id?: string | null;
}

function mapWorkspaceRow(row: WorkspaceRow): WorkspaceRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    organizationId: row.organization_id ?? undefined,
  };
}

export async function findWorkspaceBySlug(
  client: ISqlDatabase,
  ownerId: string,
  slug: string,
): Promise<WorkspaceRecord | null> {
  const rows = await client.query<WorkspaceRow>(
    `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE owner_id = ? AND slug = ?`,
    [ownerId, slug],
  );

  return rows[0] ? mapWorkspaceRow(rows[0]) : null;
}

export async function listWorkspacesByOwner(
  client: ISqlDatabase,
  ownerId: string,
): Promise<WorkspaceRecord[]> {
  const rows = await client.query<WorkspaceRow>(
    `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE owner_id = ?
     ORDER BY created_at ASC`,
    [ownerId],
  );

  return rows.map(mapWorkspaceRow);
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
}

export async function createWorkspace(
  client: ISqlDatabase,
  ownerId: string,
  input: CreateWorkspaceInput,
  now: () => string = () => new Date().toISOString(),
): Promise<WorkspaceRecord> {
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

  const existingSlug = await findWorkspaceBySlug(client, ownerId, slug);
  if (existingSlug) {
    throw new ValidationError(`Workspace slug '${slug}' already exists`);
  }

  const workspace: WorkspaceRecord = {
    id: randomUUID(),
    ownerId,
    name,
    slug,
    createdAt: now(),
  };

  await client.execute(
    `INSERT INTO workspaces (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
    [workspace.id, workspace.ownerId, workspace.name, workspace.slug, workspace.createdAt],
  );

  return workspace;
}

export async function findWorkspaceById(
  client: ISqlDatabase,
  ownerId: string,
  workspaceId: string,
): Promise<WorkspaceRecord | null> {
  const rows = await client.query<WorkspaceRow>(
    `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE id = ? AND owner_id = ?`,
    [workspaceId, ownerId],
  );

  return rows[0] ? mapWorkspaceRow(rows[0]) : null;
}

export async function findDefaultWorkspace(
  client: ISqlDatabase,
  ownerId: string,
): Promise<WorkspaceRecord | null> {
  const rows = await client.query<WorkspaceRow>(
    `SELECT id, owner_id, name, slug, created_at, organization_id
     FROM workspaces
     WHERE owner_id = ? AND slug = ?`,
    [ownerId, DEFAULT_WORKSPACE_SLUG],
  );

  return rows[0] ? mapWorkspaceRow(rows[0]) : null;
}

/**
 * Returns the owner's default workspace, creating it lazily if missing (ADR-007 Appendix C).
 */
export async function ensureDefaultWorkspace(
  client: ISqlDatabase,
  ownerId: string,
  now: () => string = () => new Date().toISOString(),
): Promise<{ workspace: WorkspaceRecord; created: boolean }> {
  const existing = await findDefaultWorkspace(client, ownerId);
  if (existing) {
    return { workspace: existing, created: false };
  }

  const workspace: WorkspaceRecord = {
    id: randomUUID(),
    ownerId,
    name: DEFAULT_WORKSPACE_NAME,
    slug: DEFAULT_WORKSPACE_SLUG,
    createdAt: now(),
  };

  await client.execute(
    `INSERT INTO workspaces (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
    [workspace.id, workspace.ownerId, workspace.name, workspace.slug, workspace.createdAt],
  );

  return { workspace, created: true };
}
