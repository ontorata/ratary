import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { FederationController } from '../../controllers/federation.controller.js';

const pullBodySchema = z.object({
  peerId: z.string().uuid(),
  sourceNodeId: z.string().uuid(),
  sourceOwnerId: z.string().min(1),
  sourceWorkspaceId: z.string().uuid().optional(),
  targetWorkspaceId: z.string().uuid().optional(),
  memoryIds: z.array(z.string().uuid()).max(100).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const pushBodySchema = z.object({
  peerId: z.string().uuid(),
  memoryIds: z.array(z.string().uuid()).min(1).max(100),
});

function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: { body: unknown }) => {
    const result = schema.safeParse(request.body);
    if (!result.success) throw result.error;
    request.body = result.data;
  };
}

export async function federationRoutes(
  fastify: FastifyInstance,
  controller: FederationController,
): Promise<void> {
  fastify.get(
    '/federation/peers',
    {
      schema: {
        tags: ['Federation'],
        summary: 'List federation peers visible to caller scope (ADR-029 Phase 14)',
      },
    },
    controller.listPeers.bind(controller),
  );

  fastify.get(
    '/federation/status',
    {
      schema: {
        tags: ['Federation'],
        summary: 'Federation node status and sync metadata',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.post(
    '/federation/exchange/pull',
    {
      preValidation: [validateBody(pullBodySchema)],
      schema: {
        tags: ['Federation'],
        summary: 'Pull federated memory bundle and apply locally',
      },
    },
    controller.pull.bind(controller),
  );

  fastify.post(
    '/federation/exchange/push',
    {
      preValidation: [validateBody(pushBodySchema)],
      schema: {
        tags: ['Federation'],
        summary: 'Export local memories and push bundle to peer',
      },
    },
    controller.push.bind(controller),
  );
}
