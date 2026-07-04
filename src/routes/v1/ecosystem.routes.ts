import type { FastifyInstance } from 'fastify';
import type { EcosystemController } from '../../controllers/ecosystem.controller.js';

export async function ecosystemRoutes(
  fastify: FastifyInstance,
  controller: EcosystemController,
): Promise<void> {
  fastify.get(
    '/ecosystem/clients',
    {
      schema: {
        tags: ['Agent Ecosystem'],
        summary: 'List certified external agent client profiles (ADR-030 Phase 15)',
      },
    },
    controller.listClients.bind(controller),
  );

  fastify.get(
    '/ecosystem/clients/:type',
    {
      schema: {
        tags: ['Agent Ecosystem'],
        summary: 'Get a single agent client profile by type',
      },
    },
    controller.getClient.bind(controller),
  );

  fastify.get(
    '/ecosystem/manifest',
    {
      schema: {
        tags: ['Agent Ecosystem'],
        summary: 'Full agent ecosystem manifest for external runtimes',
      },
    },
    controller.getManifest.bind(controller),
  );
}
