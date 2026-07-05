import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { EvolutionController } from '../../controllers/evolution.controller.js';
import { ValidationError } from '../../types/errors.js';

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
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.params = result.data;
  };
}

const mergeBodySchema = z.object({
  baseVersion: z.coerce.number().int().positive(),
  incomingVersion: z.union([z.coerce.number().int().positive(), z.literal('current')]),
});

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

  fastify.post(
    '/memory/:id/versions/merge',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: {
        tags: ['Memory Evolution'],
        summary: 'Merge version snapshots into current head (D97-02)',
      },
    },
    async (request, reply) => {
      const parsed = mergeBodySchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten());
      }
      request.body = parsed.data;
      return controller.mergeVersions(request as never, reply);
    },
  );

  fastify.post(
    '/memory/:id/versions/restore/:version',
    {
      preValidation: [validateParams(versionParamSchema)],
      schema: {
        tags: ['Memory Evolution'],
        summary: 'Restore current head from an immutable version (D97-01)',
      },
    },
    controller.restoreVersion.bind(controller),
  );
}
