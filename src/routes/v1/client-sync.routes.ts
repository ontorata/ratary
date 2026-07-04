import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ClientSyncController } from '../../controllers/client-sync.controller.js';

const platformQuerySchema = z.object({
  platformId: z.string().min(1).max(100),
  cursor: z.string().optional(),
});

const pushBodySchema = z.object({
  platformId: z.string().min(1).max(100),
  cursor: z.string().optional(),
  changes: z
    .array(
      z.object({
        memoryId: z.string().uuid(),
        operation: z.enum(['create', 'update', 'delete']),
        expectedUpdatedAt: z.string().optional().nullable(),
        data: z
          .object({
            title: z.string().optional(),
            project: z.string().optional(),
            content: z.string().optional(),
            summary: z.string().optional(),
            tags: z.array(z.string()).optional(),
            favorite: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .max(100),
});

function validateQuery<T extends z.ZodType>(schema: T) {
  return async (request: { query: unknown }) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      throw result.error;
    }
    request.query = result.data;
  };
}

function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: { body: unknown }) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw result.error;
    }
    request.body = result.data;
  };
}

export async function clientSyncRoutes(
  fastify: FastifyInstance,
  controller: ClientSyncController,
): Promise<void> {
  fastify.get(
    '/sync/status',
    {
      preValidation: [validateQuery(platformQuerySchema)],
      schema: {
        tags: ['Multi-Client Sync'],
        summary: 'Sync cursor and pending conflict status for a client platform (ADR-042)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/sync/pull',
    {
      preValidation: [validateQuery(platformQuerySchema)],
      schema: {
        tags: ['Multi-Client Sync'],
        summary: 'Pull memory changes since cursor for a client platform',
      },
    },
    controller.pull.bind(controller),
  );

  fastify.post(
    '/sync/push',
    {
      preValidation: [validateBody(pushBodySchema)],
      schema: {
        tags: ['Multi-Client Sync'],
        summary: 'Push memory changes from a client platform with conflict resolution',
      },
    },
    controller.push.bind(controller),
  );
}
