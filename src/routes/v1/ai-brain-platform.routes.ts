import type { FastifyInstance } from 'fastify';
import type { AiBrainPlatformController } from '../../controllers/ai-brain-platform.controller.js';

export async function aiBrainPlatformRoutes(
  fastify: FastifyInstance,
  controller: AiBrainPlatformController,
): Promise<void> {
  fastify.get(
    '/platform/status',
    { schema: { tags: ['Ratary Platform'], summary: 'Platform status (Phase 24)' } },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/platform/manifest',
    { schema: { tags: ['Ratary Platform'], summary: 'Umbrella platform manifest' } },
    controller.getManifest.bind(controller),
  );

  fastify.get(
    '/platform/webhooks',
    { schema: { tags: ['Ratary Platform'], summary: 'List webhook subscriptions' } },
    controller.listWebhooks.bind(controller),
  );

  fastify.post(
    '/platform/webhooks',
    { schema: { tags: ['Ratary Platform'], summary: 'Create webhook subscription' } },
    controller.createWebhook.bind(controller),
  );

  fastify.delete(
    '/platform/webhooks/:id',
    { schema: { tags: ['Ratary Platform'], summary: 'Delete webhook subscription' } },
    controller.deleteWebhook.bind(controller),
  );
}
