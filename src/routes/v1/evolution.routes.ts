import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { EvolutionController } from '../../controllers/evolution.controller.js';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const versionParamSchema = z.object({
  id: z.string().uuid(),
  version: z.string().regex(/^\d+$/),
});

function validateParams<T extends z.ZodType>(schema: T) {
  return async (request: { params: unknown }) => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw result.error;
    }
    request.params = result.data;
  };
}

export async function evolutionRoutes(
  fastify: FastifyInstance,
  controller: EvolutionController,
): Promise<void> {
  fastify.get(
    '/memory/:id/versions',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: {
        tags: ['Memory Evolution'],
        summary: 'List immutable memory version history (ADR-040)',
      },
    },
    controller.listVersions.bind(controller),
  );

  fastify.get(
    '/memory/:id/versions/:version/diff',
    {
      preValidation: [validateParams(versionParamSchema)],
      schema: {
        tags: ['Memory Evolution'],
        summary: 'Diff a historical version against current or another version',
      },
    },
    controller.diffVersion.bind(controller),
  );
}
