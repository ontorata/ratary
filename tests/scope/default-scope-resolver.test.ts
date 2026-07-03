import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import {
  DEFAULT_WORKSPACE_SLUG,
  ensureDefaultWorkspace,
  findDefaultWorkspace,
  findWorkspaceById,
} from '../../src/scope/workspace-store.js';
import type { AuthUser } from '../../src/auth/auth.types.js';
import { NotFoundError } from '../../src/types/errors.js';

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
    if (/FROM workspaces/i.test(sql) && /WHERE id = \? AND owner_id = \?/i.test(sql)) {
      const [id, ownerId] = params as [string, string];
      return this.workspaces
        .filter((w) => w.id === id && w.owner_id === ownerId)
        .map((w) => ({ ...w })) as T[];
    }

    if (/WHERE owner_id = \? AND slug = \?/i.test(sql)) {
      const [ownerId, slug] = params as [string, string];
      return this.workspaces
        .filter((w) => w.owner_id === ownerId && w.slug === slug)
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

const authUser = (ownerId: string): AuthUser => ({
  ownerId,
  identityId: 'identity-1',
  identityType: 'api_key',
  clientId: null,
  permissions: ['memory.read', 'memory.write'],
});

describe('workspace-store', () => {
  it('should find workspace by id for the owning owner only', async () => {
    const db = new FakeWorkspaceDb([
      {
        id: 'ws-1',
        owner_id: 'owner-a',
        name: 'Default',
        slug: 'default',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(await findWorkspaceById(asSqlDatabase(db), 'owner-a', 'ws-1')).toMatchObject({ id: 'ws-1' });
    expect(await findWorkspaceById(asSqlDatabase(db), 'owner-b', 'ws-1')).toBeNull();
  });

  it('should create default workspace lazily', async () => {
    const db = new FakeWorkspaceDb();
    const fixedNow = () => '2026-07-03T00:00:00.000Z';

    const first = await ensureDefaultWorkspace(asSqlDatabase(db), 'owner-a', fixedNow);
    const second = await ensureDefaultWorkspace(asSqlDatabase(db), 'owner-a', fixedNow);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(first.workspace.slug).toBe(DEFAULT_WORKSPACE_SLUG);
    expect(second.workspace.id).toBe(first.workspace.id);
    expect(db.workspaces).toHaveLength(1);
  });
});

describe('DefaultScopeResolver', () => {
  it('should resolve REST request to explicit workspace when owned', async () => {
    const db = new FakeWorkspaceDb([
      {
        id: 'ws-custom',
        owner_id: 'owner-a',
        name: 'Team',
        slug: 'team',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'ws-default',
        owner_id: 'owner-a',
        name: 'Default',
        slug: 'default',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const resolver = new DefaultScopeResolver(asSqlDatabase(db));

    const scope = await resolver.resolveFromRequest(authUser('owner-a'), {
      workspaceId: 'ws-custom',
      agentId: 'agent-cursor',
      projectId: 'ai-brain',
    });

    expect(scope).toEqual({
      ownerId: 'owner-a',
      workspaceId: 'ws-custom',
      agentId: 'agent-cursor',
      projectId: 'ai-brain',
    });
  });

  it('should reject REST request for workspace owned by another owner', async () => {
    const db = new FakeWorkspaceDb([
      {
        id: 'ws-other',
        owner_id: 'owner-b',
        name: 'Default',
        slug: 'default',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const resolver = new DefaultScopeResolver(asSqlDatabase(db));

    await expect(
      resolver.resolveFromRequest(authUser('owner-a'), { workspaceId: 'ws-other' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should fall back to default workspace when REST hint is omitted', async () => {
    const db = new FakeWorkspaceDb([
      {
        id: 'ws-default',
        owner_id: 'owner-a',
        name: 'Default',
        slug: 'default',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const resolver = new DefaultScopeResolver(asSqlDatabase(db));

    const scope = await resolver.resolveFromRequest(authUser('owner-a'));

    expect(scope.workspaceId).toBe('ws-default');
    expect(scope.ownerId).toBe('owner-a');
  });

  it('should create default workspace on first REST request when missing', async () => {
    const db = new FakeWorkspaceDb();
    const resolver = new DefaultScopeResolver(asSqlDatabase(db));

    const scope = await resolver.resolveFromRequest(authUser('owner-new'));

    expect(scope.workspaceId).toBeDefined();
    expect(await findDefaultWorkspace(asSqlDatabase(db), 'owner-new')).toMatchObject({
      id: scope.workspaceId,
      slug: DEFAULT_WORKSPACE_SLUG,
    });
  });

  it('should resolve MCP env with explicit workspace and agent', async () => {
    const db = new FakeWorkspaceDb([
      {
        id: 'ws-mcp',
        owner_id: 'owner-a',
        name: 'Default',
        slug: 'default',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const resolver = new DefaultScopeResolver(asSqlDatabase(db));

    const scope = await resolver.resolveFromMcp({
      ownerId: 'owner-a',
      workspaceId: 'ws-mcp',
      agentId: 'agent-mcp',
    });

    expect(scope).toEqual({
      ownerId: 'owner-a',
      workspaceId: 'ws-mcp',
      agentId: 'agent-mcp',
    });
  });

  it('should fall back to default workspace for MCP when workspace env is omitted', async () => {
    const db = new FakeWorkspaceDb([
      {
        id: 'ws-default',
        owner_id: 'owner-a',
        name: 'Default',
        slug: 'default',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const resolver = new DefaultScopeResolver(asSqlDatabase(db));

    const scope = await resolver.resolveFromMcp({ ownerId: 'owner-a' });

    expect(scope.workspaceId).toBe('ws-default');
  });
});
