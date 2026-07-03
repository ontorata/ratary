import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import {
  createWorkspace,
  listWorkspacesByOwner,
  DEFAULT_WORKSPACE_SLUG,
} from '../../src/scope/workspace-store.js';
import { ValidationError } from '../../src/types/errors.js';

interface WorkspaceRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
}

class FakeWorkspaceDb implements D1Client {
  constructor(public workspaces: WorkspaceRow[] = []) {}

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/WHERE owner_id = \? AND slug = \?/i.test(sql)) {
      const [ownerId, slug] = params as [string, string];
      return this.workspaces
        .filter((w) => w.owner_id === ownerId && w.slug === slug)
        .map((w) => ({ ...w })) as T[];
    }

    if (/WHERE owner_id = \?/i.test(sql) && /ORDER BY created_at ASC/i.test(sql)) {
      const [ownerId] = params as [string];
      return this.workspaces
        .filter((w) => w.owner_id === ownerId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((w) => ({ ...w })) as T[];
    }

    throw new Error(`Unexpected query: ${sql}`);
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    if (/INSERT INTO workspaces/i.test(sql)) {
      const [id, owner_id, name, slug, created_at] = params as string[];
      this.workspaces.push({ id, owner_id, name, slug, created_at });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    throw new Error(`Unexpected execute: ${sql}`);
  }
}

describe('workspace-store create/list', () => {
  it('should create workspace with generated slug', async () => {
    const db = new FakeWorkspaceDb();
    const workspace = await createWorkspace(db, 'owner-1', { name: 'Team Alpha' });

    expect(workspace.slug).toBe('team-alpha');
    expect(workspace.ownerId).toBe('owner-1');
    expect(await listWorkspacesByOwner(db, 'owner-1')).toHaveLength(1);
  });

  it('should reject reserved default slug', async () => {
    const db = new FakeWorkspaceDb();
    await expect(
      createWorkspace(db, 'owner-1', { name: 'Default', slug: DEFAULT_WORKSPACE_SLUG }),
    ).rejects.toThrow(ValidationError);
  });

  it('should reject duplicate slug for same owner', async () => {
    const db = new FakeWorkspaceDb();
    await createWorkspace(db, 'owner-1', { name: 'One', slug: 'shared' });
    await expect(createWorkspace(db, 'owner-1', { name: 'Two', slug: 'shared' })).rejects.toThrow(
      ValidationError,
    );
  });
});
