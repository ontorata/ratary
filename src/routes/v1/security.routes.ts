import type { FastifyInstance } from 'fastify';
import type { SecurityController } from '../../controllers/security.controller.js';

export async function securityRoutes(
  fastify: FastifyInstance,
  controller: SecurityController,
): Promise<void> {
  fastify.get(
    '/security/status',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'Enterprise security layer status (Phase 17)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/security/hierarchy',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'List departments for an organization',
      },
    },
    controller.getHierarchy.bind(controller),
  );

  fastify.get(
    '/security/quota',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'Current quota status for authenticated identity',
      },
    },
    controller.getQuota.bind(controller),
  );

  fastify.get(
    '/security/idp/providers',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'List supported IdP connector profiles',
      },
    },
    controller.listIdpProviders.bind(controller),
  );

  fastify.get(
    '/security/compliance/export',
    {
      schema: {
        tags: ['Enterprise Security'],
        summary: 'Export compliance audit events',
      },
    },
    controller.exportCompliance.bind(controller),
  );
}
