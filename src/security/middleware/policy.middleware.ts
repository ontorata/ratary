import type { FastifyReply, FastifyRequest } from 'fastify';
import { PolicyDeniedError } from '../../types/errors.js';
import type { IPolicyEngine } from '../ports/ipolicy-engine.port.js';
import type { ITenantHierarchy } from '../ports/itenant-hierarchy.port.js';
import type { IComplianceAuditor } from '../ports/icompliance-auditor.port.js';
import { buildTransportContextFromRestRequest } from '../../transport/shared/resolve-transport-scope.js';

function isPublicPath(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  if (path.startsWith('/docs')) return true;
  if (path === '/api/v1/capabilities') return true;
  if (path.startsWith('/api/v1/ecosystem/')) return true;
  if (path === '/api/v1/health' || path === '/health' || path === '/') return true;
  if (path.startsWith('/api/v1/auth/sso/')) return true;
  return false;
}

function resolveAction(method: string): 'read' | 'write' | 'admin' {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return 'read';
  return 'write';
}

export interface PolicyMiddlewareDeps {
  policyEngine: IPolicyEngine;
  tenantHierarchy: ITenantHierarchy;
  complianceAuditor?: IComplianceAuditor;
}

export function createPolicyMiddleware(deps: PolicyMiddlewareDeps) {
  return async function enforcePolicy(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (isPublicPath(request.url)) return;
    if (!request.user) return;

    const transport = buildTransportContextFromRestRequest(request);
    const organizationId = transport.organizationId;
    const workspaceId = transport.workspaceId;

    const hierarchy =
      organizationId && workspaceId
        ? await deps.tenantHierarchy.resolveHierarchyForWorkspace(organizationId, workspaceId)
        : { workspaceId, organizationId };

    const scope = {
      ownerId: request.user.ownerId,
      workspaceId,
      organizationId,
      departmentId: hierarchy.departmentId,
      tenantProjectId: hierarchy.tenantProjectId,
    };

    const result = await deps.policyEngine.evaluate({
      user: request.user,
      scope,
      hierarchy,
      method: request.method,
      path: request.url.split('?')[0] ?? request.url,
      action: resolveAction(request.method),
    });

    if (!result.allowed) {
      await deps.complianceAuditor?.record({
        eventType: 'policy.denied',
        actorId: request.user.identityId,
        organizationId,
        workspaceId,
        resource: request.url,
        action: resolveAction(request.method),
        outcome: 'deny',
        metadata: { reason: result.reason, policyId: result.policyId },
        timestamp: new Date().toISOString(),
      });
      throw new PolicyDeniedError(result.reason ?? 'Policy denied');
    }

    await deps.complianceAuditor?.record({
      eventType: 'policy.allowed',
      actorId: request.user.identityId,
      organizationId,
      workspaceId,
      resource: request.url,
      action: resolveAction(request.method),
      outcome: 'allow',
      metadata: { policyId: result.policyId },
      timestamp: new Date().toISOString(),
    });
  };
}
