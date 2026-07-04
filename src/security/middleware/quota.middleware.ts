import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IQuotaEnforcer } from '../ports/iquota-enforcer.port.js';
import { buildTransportContextFromRestRequest } from '../../transport/shared/resolve-transport-scope.js';

function isPublicPath(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  if (path.startsWith('/docs')) return true;
  if (path === '/api/v1/capabilities') return true;
  if (path.startsWith('/api/v1/ecosystem/')) return true;
  if (path === '/api/v1/health' || path === '/health' || path === '/') return true;
  if (path.startsWith('/api/v1/auth/sso/')) return true;
  if (path.startsWith('/.well-known/oauth-protected-resource')) return true;
  return false;
}

function resolveAction(method: string): 'read' | 'write' {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return 'read';
  return 'write';
}

export function createQuotaMiddleware(quotaEnforcer: IQuotaEnforcer) {
  return async function enforceQuota(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (isPublicPath(request.url)) return;
    if (!request.user) return;

    const transport = buildTransportContextFromRestRequest(request);
    await quotaEnforcer.assertWithinQuota({
      user: request.user,
      scope: {
        ownerId: request.user.ownerId,
        workspaceId: transport.workspaceId,
        organizationId: transport.organizationId,
      },
      method: request.method,
      path: request.url.split('?')[0] ?? request.url,
      action: resolveAction(request.method),
    });
  };
}
