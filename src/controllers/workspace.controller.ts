import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAgentIdentity } from '../agent/iagent-identity.interface.js';
import type { AgentRecord } from '../agent/agent.types.js';
import type { D1Client } from '../db/d1-client.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import {
  createWorkspace,
  ensureDefaultWorkspace,
  listWorkspacesByOwner,
  type WorkspaceRecord,
} from '../scope/workspace-store.js';
import {
  extractScopeHintsFromRequest,
  resolveMemoryScopeFromRequest,
} from '../scope/resolve-request-scope.js';
import type { CreateWorkspaceBody, RegisterAgentBody } from '../types/workspace.js';
import { UnauthorizedError } from '../types/errors.js';

function toWorkspaceResponse(workspace: WorkspaceRecord) {
  return {
    id: workspace.id,
    ownerId: workspace.ownerId,
    name: workspace.name,
    slug: workspace.slug,
    createdAt: workspace.createdAt,
  };
}

function toAgentResponse(agent: AgentRecord) {
  return {
    id: agent.id,
    workspaceId: agent.workspaceId,
    ownerId: agent.ownerId,
    name: agent.name,
    clientId: agent.clientId,
    agentType: agent.agentType,
    metadata: agent.metadata,
    createdAt: agent.createdAt,
    active: agent.active,
  };
}

export class WorkspaceController {
  constructor(
    private readonly db: D1Client,
    private readonly scopeResolver: IScopeResolver,
    private readonly agentIdentity: IAgentIdentity,
  ) {}

  async listWorkspaces(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user;
    if (!user?.ownerId) {
      throw new UnauthorizedError();
    }

    await ensureDefaultWorkspace(this.db, user.ownerId);
    const workspaces = await listWorkspacesByOwner(this.db, user.ownerId);
    reply.send({ workspaces: workspaces.map(toWorkspaceResponse) });
  }

  async createWorkspace(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user;
    if (!user?.ownerId) {
      throw new UnauthorizedError();
    }

    const body = request.body as CreateWorkspaceBody;
    const workspace = await createWorkspace(this.db, user.ownerId, body);
    reply.status(201).send(toWorkspaceResponse(workspace));
  }

  private async resolveWorkspaceScope(
    request: FastifyRequest,
    workspaceId: string,
  ): Promise<Awaited<ReturnType<typeof resolveMemoryScopeFromRequest>>> {
    const user = request.user;
    if (!user?.ownerId) {
      throw new UnauthorizedError();
    }

    return this.scopeResolver.resolveFromRequest(user, {
      ...extractScopeHintsFromRequest(request),
      workspaceId,
    });
  }

  async listAgents(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const scope = await this.resolveWorkspaceScope(request, request.params.id);
    const agents = await this.agentIdentity.listByWorkspace(scope);
    reply.send({ agents: agents.map(toAgentResponse) });
  }

  async registerAgent(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const scope = await this.resolveWorkspaceScope(request, request.params.id);
    const agent = await this.agentIdentity.register(scope, request.body as RegisterAgentBody);
    reply.status(201).send(toAgentResponse(agent));
  }
}

export function createWorkspaceController(
  db: D1Client,
  scopeResolver: IScopeResolver,
  agentIdentity: IAgentIdentity,
): WorkspaceController {
  return new WorkspaceController(db, scopeResolver, agentIdentity);
}
