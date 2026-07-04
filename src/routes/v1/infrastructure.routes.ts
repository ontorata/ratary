import type { FastifyInstance } from 'fastify';
import type { InfrastructureController } from '../../controllers/infrastructure.controller.js';

export async function infrastructureRoutes(
  fastify: FastifyInstance,
  controller: InfrastructureController,
): Promise<void> {
  fastify.get(
    '/infrastructure/status',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'AI infrastructure platform status (Phase 20)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/infrastructure/manifest',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'Infrastructure platform manifest for all protocols',
      },
    },
    controller.getInfrastructureManifest.bind(controller),
  );

  fastify.get(
    '/infrastructure/marketplace',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'Browse curated provider marketplace catalog',
      },
    },
    controller.listMarketplace.bind(controller),
  );

  fastify.get(
    '/infrastructure/marketplace/:pluginId',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'Get marketplace entry by plugin id',
      },
    },
    controller.getMarketplaceEntry.bind(controller),
  );

  fastify.get(
    '/infrastructure/plugins',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'List registered plugins on this node',
      },
    },
    controller.listPlugins.bind(controller),
  );

  fastify.post(
    '/infrastructure/plugins/register',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'Register a signed provider plugin manifest',
      },
    },
    controller.registerPlugin.bind(controller),
  );

  fastify.post(
    '/infrastructure/plugins/:pluginId/enable',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'Enable a registered plugin for its type',
      },
    },
    controller.enablePlugin.bind(controller),
  );

  fastify.post(
    '/infrastructure/plugins/:pluginId/disable',
    {
      schema: {
        tags: ['AI Infrastructure'],
        summary: 'Disable a registered plugin',
      },
    },
    controller.disablePlugin.bind(controller),
  );
}
