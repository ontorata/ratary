import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { CompressionAdminController } from '../../controllers/compression-admin.controller.js';
import { ValidationError } from '../../types/errors.js';

const compressBodySchema = z.object({
  dryRun: z.boolean().optional(),
  project: z.string().optional(),
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

export async function adminCompressionRoutes(
  fastify: FastifyInstance,
  controller: CompressionAdminController,
): Promise<void> {
  fastify.post(
    '/admin/compress',
    {
      preValidation: [validateBody(compressBodySchema)],
      schema: {
        tags: ['Admin'],
        summary: 'Run semantic compression batch for the authenticated owner (ADR-023)',
      },
    },
    controller.compress.bind(controller),
  );
}
