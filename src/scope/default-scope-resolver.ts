import type { AuthUser } from '../auth/auth.types.js';
import { assertScopeHintsMatchAuthTenant } from '../auth/tenant-context.js';
import { NotFoundError, TenantContextRequiredError } from '../types/errors.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type {
  IScopeResolver,
  McpScopeEnv,
  ScopeResolutionHints,
} from './iscope-resolver.interface.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { ensureDefaultWorkspace, findWorkspaceById } from './workspace-store.js';

/**
 * Resolves effective MemoryScope from REST auth or MCP env (ADR-007).
 * REST: requires explicit tenant context on AuthUser — no silent default workspace.
 * MCP remote: same tenant + permission boundary as REST (Wave 4 transport parity).
 */
export class DefaultScopeResolver implements IScopeResolver {
  constructor(private readonly db: ISqlDatabase) {}

  async resolveFromRequest(auth: AuthUser, hints?: ScopeResolutionHints): Promise<MemoryScope> {
    assertScopeHintsMatchAuthTenant(auth, hints);

    const organizationId = hints?.organizationId?.trim() ?? auth.organizationId;
    const workspaceId = hints?.workspaceId?.trim() ?? auth.workspaceId;

    if (!organizationId || !workspaceId) {
      throw new TenantContextRequiredError(
        'Organization and workspace context are required for this request',
      );
    }

    const workspace = await findWorkspaceById(this.db, auth.ownerId, workspaceId, {
      organizationId,
    });
    if (!workspace) {
      throw new NotFoundError('Workspace', workspaceId);
    }

    const scope: MemoryScope = {
      ownerId: auth.ownerId,
      organizationId,
      workspaceId,
    };

    const projectId = hints?.projectId?.trim();
    if (projectId) {
      scope.projectId = projectId;
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
      scope.organizationId = workspace.organizationId;
    } else {
      const { workspace } = await ensureDefaultWorkspace(this.db, env.ownerId);
      scope.workspaceId = workspace.id;
      scope.organizationId = workspace.organizationId;
    }

    const agentId = env.agentId?.trim();
    if (agentId) {
      scope.agentId = agentId;
    }

    return scope;
  }
}
