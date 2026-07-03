import type { D1Client } from '../db/d1-client.js';
import { findWorkspaceById } from '../scope/workspace-store.js';
import { NotFoundError, ValidationError } from '../types/errors.js';
import { hasWorkspaceScope, type MemoryScope } from '../types/memory-scope.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import type { AgentDescriptor, AgentRecord, AgentType } from './agent.types.js';
import type { IAgentIdentity } from './iagent-identity.interface.js';

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

function rowToAgent(row: AgentRow): AgentRecord {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata || '{}') as Record<string, unknown>;
  } catch {
    // keep empty
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerId: row.owner_id,
    name: row.name,
    clientId: row.client_id,
    agentType: row.agent_type as AgentType,
    metadata,
    createdAt: row.created_at,
    active: row.active === 1,
  };
}

function requireWorkspaceScope(
  scope: MemoryScope,
): asserts scope is MemoryScope & { workspaceId: string } {
  if (!hasWorkspaceScope(scope)) {
    throw new ValidationError('workspaceId is required for agent operations');
  }
}

/**
 * D1-backed agent registry within a workspace (ADR-007).
 */
export class D1AgentIdentity implements IAgentIdentity {
  constructor(private readonly db: D1Client) {}

  async register(scope: MemoryScope, descriptor: AgentDescriptor): Promise<AgentRecord> {
    requireWorkspaceScope(scope);

    const name = descriptor.name.trim();
    if (!name) {
      throw new ValidationError('Agent name is required');
    }

    const workspace = await findWorkspaceById(this.db, scope.ownerId, scope.workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace', scope.workspaceId);
    }

    const id = generateId();
    const createdAt = nowISO();
    const agentType = descriptor.agentType ?? 'mcp';
    const clientId = descriptor.clientId ?? null;

    await this.db.execute(
      `INSERT INTO agents (id, workspace_id, owner_id, name, client_id, agent_type, metadata, created_at, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        scope.workspaceId,
        scope.ownerId,
        name,
        clientId,
        agentType,
        JSON.stringify(descriptor.metadata ?? {}),
        createdAt,
      ],
    );

    const agent = await this.findScopedAgent(scope, id);
    if (!agent) {
      throw new Error('Failed to retrieve inserted agent');
    }

    return agent;
  }

  async resolve(scope: MemoryScope, agentId: string): Promise<AgentRecord | null> {
    requireWorkspaceScope(scope);
    return this.findScopedAgent(scope, agentId, true);
  }

  async listByWorkspace(scope: MemoryScope): Promise<AgentRecord[]> {
    requireWorkspaceScope(scope);

    const workspace = await findWorkspaceById(this.db, scope.ownerId, scope.workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace', scope.workspaceId);
    }

    const rows = await this.db.query<AgentRow>(
      `SELECT id, workspace_id, owner_id, name, client_id, agent_type, metadata, created_at, active
       FROM agents
       WHERE owner_id = ? AND workspace_id = ? AND active = 1
       ORDER BY created_at DESC`,
      [scope.ownerId, scope.workspaceId],
    );

    return rows.map(rowToAgent);
  }

  private async findScopedAgent(
    scope: MemoryScope & { workspaceId: string },
    agentId: string,
    activeOnly = false,
  ): Promise<AgentRecord | null> {
    const activeClause = activeOnly ? ' AND active = 1' : '';
    const rows = await this.db.query<AgentRow>(
      `SELECT id, workspace_id, owner_id, name, client_id, agent_type, metadata, created_at, active
       FROM agents
       WHERE id = ? AND owner_id = ? AND workspace_id = ?${activeClause}`,
      [agentId, scope.ownerId, scope.workspaceId],
    );

    return rows[0] ? rowToAgent(rows[0]) : null;
  }
}
