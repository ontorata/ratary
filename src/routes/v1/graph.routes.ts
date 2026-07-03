import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { GraphController } from '../../controllers/graph.controller.js';
import { traverseGraphBodySchema } from '../../types/graph.js';
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

export async function graphRoutes(
  fastify: FastifyInstance,
  controller: GraphController,
): Promise<void> {
  fastify.get(
    '/graph/capabilities',
    {
      schema: {
        tags: ['Knowledge Graph'],
        summary: 'Graph traversal capabilities',
      },
    },
    controller.getCapabilities.bind(controller),
  );

  fastify.post(
    '/graph/traverse',
    {
      preValidation: [validateBody(traverseGraphBodySchema)],
      schema: {
        tags: ['Knowledge Graph'],
        summary: 'Bidirectional BFS traversal from a seed memory',
      },
    },
    controller.traverse.bind(controller),
  );
}
