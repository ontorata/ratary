import type { FastifyInstance } from 'fastify';
import type { CapabilitiesController } from '../../controllers/capabilities.controller.js';

export async function capabilitiesRoutes(
  fastify: FastifyInstance,
  controller: CapabilitiesController,
): Promise<void> {
  fastify.get(
    '/capabilities',
    {
      schema: {
        tags: ['Capabilities'],
        summary: 'Machine-readable deployment capability manifest (ADR-025)',
        description:
          'Returns feature flags, limits, MCP tool registry, and protocol version for external agent runtimes.',
      },
    },
    controller.getManifest.bind(controller),
  );
}
