import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ContextController } from '../../controllers/context.controller.js';
import { buildContextBodySchema } from '../../types/context.js';
import { ValidationError } from '../../types/errors.js';

function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: { body: unknown }): Promise<void> => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.body = result.data;
  };
}

export async function contextRoutes(
  fastify: FastifyInstance,
  controller: ContextController,
): Promise<void> {
  fastify.post(
    '/context',
    {
      preValidation: [validateBody(buildContextBodySchema)],
      schema: {
        tags: ['Memory Intelligence'],
        summary: 'Build ranked memory context and LLM prompt for a task',
      },
    },
    controller.buildContext.bind(controller),
  );

  fastify.get(
    '/context/packages/:packageId',
    {
      schema: {
        tags: ['Memory Intelligence'],
        summary: 'Get Context Package lifecycle state (ADR-1013)',
      },
    },
    controller.getPackageLifecycle.bind(controller),
  );

  fastify.post(
    '/context/packages/:packageId/retire',
    {
      schema: {
        tags: ['Memory Intelligence'],
        summary: 'Retire a Context Package (active → retired)',
      },
    },
    controller.retirePackage.bind(controller),
  );

  fastify.post(
    '/context/packages/:packageId/archive',
    {
      schema: {
        tags: ['Memory Intelligence'],
        summary: 'Archive a Context Package (active|retired → archived)',
      },
    },
    controller.archivePackage.bind(controller),
  );
}
