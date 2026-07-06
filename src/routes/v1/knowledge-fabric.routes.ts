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

  fastify.post(
    '/knowledge-fabric/sync/:connectorId',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Enqueue async connector sync (Phase 29)',
      },
    },
    controller.enqueueSync.bind(controller),
  );

  fastify.get(
    '/knowledge-fabric/sync/jobs/:jobId',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Get async connector sync job status',
      },
    },
    controller.getSyncJob.bind(controller),
  );

  fastify.post(
    '/knowledge-fabric/webhooks/:connectorId',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Webhook push ingest with HMAC verification (Phase 29)',
      },
    },
    controller.receiveWebhook.bind(controller),
  );

  fastify.post(
    '/knowledge-fabric/sync/peer/:peerId',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'Pull knowledge from federation peer (Phase 32 universal fabric)',
      },
    },
    controller.pullFromPeer.bind(controller),
  );

  fastify.get(
    '/knowledge-fabric/provenance',
    {
      schema: {
        tags: ['Enterprise Knowledge Fabric'],
        summary: 'List unified fabric provenance records (Phase 32)',
      },
    },
    controller.listProvenance.bind(controller),
  );
}
