import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { SecurityPorts } from '../composition/create-security-ports.js';
import { ValidationError } from '../types/errors.js';

export function createSecurityController(env: Env, ports: SecurityPorts) {
  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        policyEngine: env.POLICY_ENGINE,
        ssoEnabled: env.SSO_ENABLED,
        quotaEnforcer: env.QUOTA_ENFORCER,
        hierarchyEnabled: ports.enabled,
      });
    },

    async getHierarchy(
      request: FastifyRequest<{ Querystring: { organizationId?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const organizationId = request.query.organizationId?.trim();
      if (!organizationId) {
        throw new ValidationError('organizationId query parameter is required');
      }
      const departments = await ports.tenantHierarchy.listDepartments(organizationId);
      reply.send({ organizationId, departments, count: departments.length });
    },

    async getQuota(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const ownerId = request.user?.ownerId;
      if (!ownerId) {
        throw new ValidationError('Authentication required');
      }
      const transportOrg = request.headers['x-organization-id'];
      const organizationId = typeof transportOrg === 'string' ? transportOrg : undefined;
      const status = await ports.quotaEnforcer.getStatus(ownerId, organizationId);
      reply.send(status);
    },

    async listIdpProviders(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const providers = await ports.idpRegistry.listProviders();
      reply.send({ providers });
    },

    async exportCompliance(
      request: FastifyRequest<{ Querystring: { organizationId?: string; limit?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const organizationId = request.query.organizationId?.trim() ?? '';
      const limit = request.query.limit ? Number(request.query.limit) : 100;
      const events = await ports.complianceAuditor.exportEvents(organizationId, limit);
      reply.send({ events, count: events.length });
    },
  };
}

export type SecurityController = ReturnType<typeof createSecurityController>;

export function createSsoController(ports: SecurityPorts) {
  return {
    async getMetadata(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const metadata = await ports.identityFederation.getMetadata();
      reply.send(metadata);
    },

    async startLogin(
      request: FastifyRequest<{ Querystring: { redirectUri: string; provider?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      const redirectUri = request.query.redirectUri?.trim();
      if (!redirectUri) {
        throw new ValidationError('redirectUri query parameter is required');
      }
      const result = await ports.identityFederation.getLoginUrl({
        provider: request.query.provider ?? 'oidc',
        redirectUri,
      });
      reply.send(result);
    },

    async handleCallback(
      request: FastifyRequest<{
        Body: { code: string; state?: string; redirectUri: string; provider?: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      const { code, state, redirectUri, provider } = request.body;
      if (!code || !redirectUri) {
        throw new ValidationError('code and redirectUri are required');
      }
      const identity = await ports.identityFederation.handleCallback({
        provider: provider ?? 'oidc',
        code,
        state,
        redirectUri,
      });
      reply.send({ identity });
    },
  };
}

export type SsoController = ReturnType<typeof createSsoController>;
