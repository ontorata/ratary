import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import {
  backfillDefaultWorkspaces,
  DEFAULT_WORKSPACE_SLUG,
} from '../../scripts/lib/workspace-backfill.js';

interface MemoryRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
}

interface WorkspaceRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
}

/** In-memory fake handling only the SQL shapes used by the backfill. */
class FakeBackfillDb implements D1Client {
  constructor(
    public memories: MemoryRow[],
    public workspaces: WorkspaceRow[] = [],
  ) {}

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/SELECT DISTINCT owner_id FROM memories/i.test(sql)) {
      const owners = [
        ...new Set(this.memories.filter((m) => m.workspace_id === null).map((m) => m.owner_id)),
      ];
      return owners.map((owner_id) => ({ owner_id })) as T[];
    }

    if (/FROM workspaces/i.test(sql) && /WHERE owner_id = \? AND slug = \?/i.test(sql)) {
      const [ownerId, slug] = params as [string, string];
      return this.workspaces
        .filter((w) => w.owner_id === ownerId && w.slug === slug)
        .map((w) => ({ ...w })) as T[];
    }

    if (/SELECT COUNT\(\*\)/i.test(sql)) {
      const count = this.memories.filter((m) => m.workspace_id === null).length;
      return [{ count }] as T[];
    }

    throw new Error(`Unexpected query: ${sql}`);
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    if (/INSERT INTO workspaces/i.test(sql)) {
      const [id, owner_id, name, slug, created_at] = params as string[];
      this.workspaces.push({ id, owner_id, name, slug, created_at });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (/UPDATE memories SET workspace_id/i.test(sql)) {
      const [workspaceId, ownerId] = params as [string, string];
      let changes = 0;
      for (const memory of this.memories) {
        if (memory.owner_id === ownerId && memory.workspace_id === null) {
          memory.workspace_id = workspaceId;
          changes++;
        }
      }
      return { results: [], success: true, meta: { changes } };
    }

    throw new Error(`Unexpected execute: ${sql}`);
  }
}

describe('backfillDefaultWorkspaces', () => {
  it('should create a default workspace per owner and assign memories', async () => {
    const db = new FakeBackfillDb([
      { id: 'm1', owner_id: 'owner-a', workspace_id: null },
      { id: 'm2', owner_id: 'owner-a', workspace_id: null },
      { id: 'm3', owner_id: 'owner-b', workspace_id: null },
    ]);

    const result = await backfillDefaultWorkspaces(db);

    expect(result.ownersProcessed).toBe(2);
    expect(result.workspacesCreated).toBe(2);
    expect(result.memoriesUpdated).toBe(3);
    expect(result.remainingNull).toBe(0);
    expect(db.workspaces.every((w) => w.slug === DEFAULT_WORKSPACE_SLUG)).toBe(true);

    const ownerAWorkspace = db.workspaces.find((w) => w.owner_id === 'owner-a');
    expect(db.memories[0].workspace_id).toBe(ownerAWorkspace?.id);
    expect(db.memories[1].workspace_id).toBe(ownerAWorkspace?.id);
  });

  it('should reuse an existing default workspace', async () => {
    const db = new FakeBackfillDb(
      [{ id: 'm1', owner_id: 'owner-a', workspace_id: null }],
      [
        {
          id: 'ws-existing',
          owner_id: 'owner-a',
          name: 'Default',
          slug: 'default',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    );

    const result = await backfillDefaultWorkspaces(db);

    expect(result.workspacesCreated).toBe(0);
    expect(result.memoriesUpdated).toBe(1);
    expect(db.memories[0].workspace_id).toBe('ws-existing');
  });

  it('should be idempotent — second run is a no-op', async () => {
    const db = new FakeBackfillDb([
      { id: 'm1', owner_id: 'owner-a', workspace_id: null },
      { id: 'm2', owner_id: 'owner-b', workspace_id: null },
    ]);

    await backfillDefaultWorkspaces(db);
    const second = await backfillDefaultWorkspaces(db);

    expect(second.ownersProcessed).toBe(0);
    expect(second.workspacesCreated).toBe(0);
    expect(second.memoriesUpdated).toBe(0);
    expect(second.remainingNull).toBe(0);
    expect(db.workspaces).toHaveLength(2);
  });

  it('should not touch memories that already have a workspace', async () => {
    const db = new FakeBackfillDb([
      { id: 'm1', owner_id: 'owner-a', workspace_id: 'ws-custom' },
      { id: 'm2', owner_id: 'owner-a', workspace_id: null },
    ]);

    const result = await backfillDefaultWorkspaces(db);

    expect(result.memoriesUpdated).toBe(1);
    expect(db.memories[0].workspace_id).toBe('ws-custom');
  });
});
