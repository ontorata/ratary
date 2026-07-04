import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { SignalsController } from '../../controllers/signals.controller.js';
import { ValidationError } from '../../types/errors.js';

const signalBodySchema = z.object({
  type: z.literal('explicit_feedback'),
  memoryId: z.string().uuid(),
  value: z.enum(['helpful', 'not_helpful']),
  signalId: z.string().uuid().optional(),
});

function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: { body: unknown }): Promise<void> => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.body = result.data;
  };
}

export async function signalsRoutes(
  fastify: FastifyInstance,
  controller: SignalsController,
): Promise<void> {
  fastify.post(
    '/signals',
    {
      preValidation: [validateBody(signalBodySchema)],
      schema: {
        tags: ['Signals'],
        summary: 'Ingest explicit memory quality feedback (ADR-026)',
      },
    },
    controller.ingest.bind(controller),
  );
}
