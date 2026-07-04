import type { FastifyInstance } from 'fastify';
import type { KnowledgeFabricController } from '../../controllers/knowledge-fabric.controller.js';

export async function knowledgeFabricRoutes(
  fastify: FastifyInstance,
  controller: KnowledgeFabricController,
): Promise<void> {
  fastify.get(
    '/knowledge-fabric/status',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Knowledge fabric platform status (Phase 23)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/knowledge-fabric/manifest',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Knowledge fabric platform manifest',
      },
    },
    controller.getManifest.bind(controller),
  );

  fastify.get(
    '/knowledge-fabric/connectors',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'List enterprise knowledge connectors',
      },
    },
    controller.listConnectors.bind(controller),
  );

  fastify.get(
    '/knowledge-fabric/ingest/runs',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'List recent fabric ingest runs',
      },
    },
    controller.listIngestRuns.bind(controller),
  );

  fastify.get(
    '/knowledge-fabric/ingest/state/:connectorId',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Get ingest cursor for a connector',
      },
    },
    controller.getConnectorState.bind(controller),
  );

  fastify.post(
    '/knowledge-fabric/ingest/:connectorId',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Ingest external knowledge into MemoryService SSOT',
      },
    },
    controller.ingest.bind(controller),
  );
}
