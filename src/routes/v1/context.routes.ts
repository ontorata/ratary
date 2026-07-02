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
}
