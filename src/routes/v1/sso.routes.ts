import type { FastifyInstance } from 'fastify';
import type { SsoController } from '../../controllers/security.controller.js';

export async function ssoRoutes(
  fastify: FastifyInstance,
  controller: SsoController,
): Promise<void> {
  fastify.get(
    '/auth/sso/metadata',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'OIDC/SAML federation metadata (Phase 17)',
      },
    },
    controller.getMetadata.bind(controller),
  );

  fastify.get(
    '/auth/sso/login',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'Start SSO login — returns authorization URL',
      },
    },
    controller.startLogin.bind(controller),
  );

  fastify.post(
    '/auth/sso/callback',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'SSO authorization code callback',
      },
    },
    controller.handleCallback.bind(controller),
  );
}
