import type { AuthUser } from '../auth/auth.types.js';
import { NotFoundError } from '../types/errors.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type {
  IScopeResolver,
  McpScopeEnv,
  ScopeResolutionHints,
} from './iscope-resolver.interface.js';
import type { D1Client } from '../db/d1-client.js';
import { ensureDefaultWorkspace, findWorkspaceById } from './workspace-store.js';

/**
 * Resolves effective MemoryScope from REST auth or MCP env (ADR-007).
 * Default workspace is ensured lazily when no workspace hint is provided.
 */
export class DefaultScopeResolver implements IScopeResolver {
  constructor(private readonly db: D1Client) {}

  async resolveFromRequest(auth: AuthUser, hints?: ScopeResolutionHints): Promise<MemoryScope> {
    const scope: MemoryScope = { ownerId: auth.ownerId };

    const projectId = hints?.projectId?.trim();
    if (projectId) {
      scope.projectId = projectId;
    }

    const workspaceIdHint = hints?.workspaceId?.trim();
    if (workspaceIdHint) {
      const workspace = await findWorkspaceById(this.db, auth.ownerId, workspaceIdHint);
      if (!workspace) {
        throw new NotFoundError('Workspace', workspaceIdHint);
      }
      scope.workspaceId = workspace.id;
    } else {
      const { workspace } = await ensureDefaultWorkspace(this.db, auth.ownerId);
      scope.workspaceId = workspace.id;
    }

    const agentId = hints?.agentId?.trim();
    if (agentId) {
      scope.agentId = agentId;
    }

    return scope;
  }

  async resolveFromMcp(env: McpScopeEnv): Promise<MemoryScope> {
    const scope: MemoryScope = { ownerId: env.ownerId };

    const workspaceIdHint = env.workspaceId?.trim();
    if (workspaceIdHint) {
      const workspace = await findWorkspaceById(this.db, env.ownerId, workspaceIdHint);
      if (!workspace) {
        throw new NotFoundError('Workspace', workspaceIdHint);
      }
      scope.workspaceId = workspace.id;
    } else {
      const { workspace } = await ensureDefaultWorkspace(this.db, env.ownerId);
      scope.workspaceId = workspace.id;
    }

    const agentId = env.agentId?.trim();
    if (agentId) {
      scope.agentId = agentId;
    }

    return scope;
  }
}
