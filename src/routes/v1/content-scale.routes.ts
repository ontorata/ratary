import type { FastifyInstance } from 'fastify';
import type { ContentScaleController } from '../../controllers/content-scale.controller.js';

export async function contentScaleRoutes(
  fastify: FastifyInstance,
  controller: ContentScaleController,
): Promise<void> {
  fastify.get(
    '/content-scale/status',
    {
      schema: {
        tags: ['Content & Vector Scale'],
        summary: 'Content scale platform status (Phase 22)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/content-scale/manifest',
    { schema: { tags: ['Content & Vector Scale'], summary: 'Content scale platform manifest' } },
    controller.getManifest.bind(controller),
  );

  fastify.get(
    '/content-scale/sync/runs',
    { schema: { tags: ['Content & Vector Scale'], summary: 'List recent scale sync runs' } },
    controller.listSyncRuns.bind(controller),
  );

  fastify.get(
    '/content-scale/sync/state/:target',
    {
      schema: {
        tags: ['Content & Vector Scale'],
        summary: 'Get sync watermark for content, pgvector, or embedding',
      },
    },
    controller.getSyncState.bind(controller),
  );

  fastify.post(
    '/content-scale/sync/content',
    {
      schema: {
        tags: ['Content & Vector Scale'],
        summary: 'Offload large memory content to R2/S3',
      },
    },
    controller.syncContent.bind(controller),
  );

  fastify.post(
    '/content-scale/sync/pgvector',
    { schema: { tags: ['Content & Vector Scale'], summary: 'Sync embeddings to pgvector store' } },
    controller.syncPgvector.bind(controller),
  );

  fastify.post(
    '/content-scale/sync/embeddings',
    { schema: { tags: ['Content & Vector Scale'], summary: 'Run hardened embedding batch job' } },
    controller.syncEmbeddings.bind(controller),
  );
}
