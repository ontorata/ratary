import { describe, it, expect } from 'vitest';
import { asSqlDatabase } from '../helpers/sql-test-harness.js';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { D1AgentIdentity } from '../../src/agent/d1-agent-identity.js';
import type { MemoryScope } from '../../src/types/memory-scope.js';
import { NotFoundError, ValidationError } from '../../src/types/errors.js';

interface WorkspaceRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface AgentRow {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  client_id: string | null;
  agent_type: string;
  metadata: string;
  created_at: string;
  active: number;
}

class FakeAgentDb implements D1Client {
  constructor(
    public workspaces: WorkspaceRow[] = [],
    public agents: AgentRow[] = [],
  ) {}

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/FROM workspaces/i.test(sql) && /WHERE id = \? AND owner_id = \?/i.test(sql)) {
      const [id, ownerId] = params as [string, string];
      return this.workspaces
        .filter((w) => w.id === id && w.owner_id === ownerId)
        .map((w) => ({ ...w })) as T[];
    }

    if (
      /FROM agents/i.test(sql) &&
      /WHERE id = \? AND owner_id = \? AND workspace_id = \?/i.test(sql)
    ) {
      const [id, ownerId, workspaceId] = params as [string, string, string];
      const activeOnly = /AND active = 1/i.test(sql);
      return this.agents
        .filter(
          (a) =>
            a.id === id &&
            a.owner_id === ownerId &&
            a.workspace_id === workspaceId &&
            (!activeOnly || a.active === 1),
        )
        .map((a) => ({ ...a })) as T[];
    }

    if (/FROM agents/i.test(sql) && /WHERE owner_id = \? AND workspace_id = \?/i.test(sql)) {
      const [ownerId, workspaceId] = params as [string, string];
      return this.agents
        .filter((a) => a.owner_id === ownerId && a.workspace_id === workspaceId && a.active === 1)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((a) => ({ ...a })) as T[];
    }

    throw new Error(`Unexpected query: ${sql}`);
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    if (/INSERT INTO agents/i.test(sql)) {
      const [id, workspace_id, owner_id, name, client_id, agent_type, metadata, created_at] =
        params as string[];
      this.agents.push({
        id,
        workspace_id,
        owner_id,
        name,
        client_id,
        agent_type,
        metadata,
        created_at,
        active: 1,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    throw new Error(`Unexpected execute: ${sql}`);
  }
}

const workspaceScope = (ownerId: string, workspaceId: string): MemoryScope => ({
  ownerId,
  workspaceId,
});

describe('D1AgentIdentity', () => {
  const wsA = {
    id: 'ws-a',
    owner_id: 'owner-a',
    name: 'Default',
    slug: 'default',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  const wsB = {
    id: 'ws-b',
    owner_id: 'owner-b',
    name: 'Default',
    slug: 'default',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  it('should register an agent in the scoped workspace', async () => {
    const db = new FakeAgentDb([wsA]);
    const identity = new D1AgentIdentity(asSqlDatabase(db));

    const agent = await identity.register(workspaceScope('owner-a', 'ws-a'), {
      name: 'Cursor',
      agentType: 'mcp',
      clientId: 'client-cursor',
      metadata: { channel: 'ide' },
    });

    expect(agent).toMatchObject({
      workspaceId: 'ws-a',
      ownerId: 'owner-a',
      name: 'Cursor',
      clientId: 'client-cursor',
      agentType: 'mcp',
      metadata: { channel: 'ide' },
      active: true,
    });
    expect(agent.id).toBeTruthy();
    expect(db.agents).toHaveLength(1);
  });

  it('should reject register without workspaceId', async () => {
    const identity = new D1AgentIdentity(asSqlDatabase(new FakeAgentDb([wsA])));

    await expect(
      identity.register({ ownerId: 'owner-a' }, { name: 'Cursor' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should reject register for workspace not owned by scope owner', async () => {
    const identity = new D1AgentIdentity(asSqlDatabase(new FakeAgentDb([wsB])));

    await expect(
      identity.register(workspaceScope('owner-a', 'ws-b'), { name: 'Cursor' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should resolve an active agent within workspace scope', async () => {
    const db = new FakeAgentDb(
      [wsA],
      [
        {
          id: 'agent-1',
          workspace_id: 'ws-a',
          owner_id: 'owner-a',
          name: 'Cursor',
          client_id: null,
          agent_type: 'mcp',
          metadata: '{}',
          created_at: '2026-01-01T00:00:00.000Z',
          active: 1,
        },
      ],
    );
    const identity = new D1AgentIdentity(asSqlDatabase(db));

    const agent = await identity.resolve(workspaceScope('owner-a', 'ws-a'), 'agent-1');

    expect(agent?.name).toBe('Cursor');
  });

  it('should return null when resolving agent from another workspace (isolation)', async () => {
    const db = new FakeAgentDb(
      [wsA, wsB],
      [
        {
          id: 'agent-1',
          workspace_id: 'ws-a',
          owner_id: 'owner-a',
          name: 'Cursor',
          client_id: null,
          agent_type: 'mcp',
          metadata: '{}',
          created_at: '2026-01-01T00:00:00.000Z',
          active: 1,
        },
      ],
    );
    const identity = new D1AgentIdentity(asSqlDatabase(db));

    const agent = await identity.resolve(workspaceScope('owner-a', 'ws-b'), 'agent-1');

    expect(agent).toBeNull();
  });

  it('should not resolve inactive agents', async () => {
    const db = new FakeAgentDb(
      [wsA],
      [
        {
          id: 'agent-1',
          workspace_id: 'ws-a',
          owner_id: 'owner-a',
          name: 'Cursor',
          client_id: null,
          agent_type: 'mcp',
          metadata: '{}',
          created_at: '2026-01-01T00:00:00.000Z',
          active: 0,
        },
      ],
    );
    const identity = new D1AgentIdentity(asSqlDatabase(db));

    const agent = await identity.resolve(workspaceScope('owner-a', 'ws-a'), 'agent-1');

    expect(agent).toBeNull();
  });

  it('should list active agents for the workspace only', async () => {
    const db = new FakeAgentDb(
      [wsA],
      [
        {
          id: 'agent-1',
          workspace_id: 'ws-a',
          owner_id: 'owner-a',
          name: 'Cursor',
          client_id: null,
          agent_type: 'mcp',
          metadata: '{}',
          created_at: '2026-01-02T00:00:00.000Z',
          active: 1,
        },
        {
          id: 'agent-2',
          workspace_id: 'ws-a',
          owner_id: 'owner-a',
          name: 'Claude',
          client_id: null,
          agent_type: 'mcp',
          metadata: '{}',
          created_at: '2026-01-01T00:00:00.000Z',
          active: 1,
        },
        {
          id: 'agent-3',
          workspace_id: 'ws-b',
          owner_id: 'owner-a',
          name: 'Other',
          client_id: null,
          agent_type: 'bot',
          metadata: '{}',
          created_at: '2026-01-01T00:00:00.000Z',
          active: 1,
        },
        {
          id: 'agent-4',
          workspace_id: 'ws-a',
          owner_id: 'owner-a',
          name: 'Retired',
          client_id: null,
          agent_type: 'mcp',
          metadata: '{}',
          created_at: '2026-01-03T00:00:00.000Z',
          active: 0,
        },
      ],
    );
    const identity = new D1AgentIdentity(asSqlDatabase(db));

    const agents = await identity.listByWorkspace(workspaceScope('owner-a', 'ws-a'));

    expect(agents.map((a) => a.id)).toEqual(['agent-1', 'agent-2']);
  });
});
