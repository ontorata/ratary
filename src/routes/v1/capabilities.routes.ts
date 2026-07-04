import type { FastifyInstance } from 'fastify';
import type { CapabilitiesController } from '../../controllers/capabilities.controller.js';
import {
  capabilityNegotiationResultOpenApiSchema,
  clientCapabilityRequestOpenApiSchema,
} from '../../capabilities/capability-openapi.schemas.js';

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
        response: {
          200: {
            description: 'Full capability manifest',
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
    controller.getManifest.bind(controller),
  );

  fastify.post(
    '/capabilities/negotiate',
    {
      schema: {
        tags: ['Capabilities'],
        summary: 'Bidirectional capability negotiation handshake (D7.5-03)',
        description:
          'Client declares protocol version, required/preferred capabilities, and transports; server returns negotiated matrix.',
        body: clientCapabilityRequestOpenApiSchema,
        response: {
          200: {
            description: 'Negotiation result matrix',
            ...capabilityNegotiationResultOpenApiSchema,
          },
        },
      },
    },
    controller.negotiate.bind(controller),
  );
}
