import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IWorkspaceMembership } from '../ports/enterprise/iworkspace-membership.port.js';
import type { WorkspacePermission } from '../ports/enterprise/iworkspace-membership.port.js';

function headerWorkspaceId(request: FastifyRequest): string | undefined {
  const raw = request.headers['x-workspace-id'];
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  return undefined;
}

function requiredPermission(method: string): WorkspacePermission {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return 'memory.read';
  }
  return 'memory.write';
}

export function createWorkspaceMembershipMiddleware(membership: IWorkspaceMembership) {
  return async function enforceWorkspaceMembership(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const workspaceId = headerWorkspaceId(request);
    const identityId = request.user?.identityId;
    if (!workspaceId || !identityId) {
      return;
    }

    await membership.assertAccess(identityId, workspaceId, requiredPermission(request.method));
  };
}
