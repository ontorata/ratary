import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  createMemorySchema,
  updateMemorySchema,
  listMemoriesQuerySchema,
  searchQuerySchema,
  backupImportSchema,
} from '../types/memory.js';
import { similarMemoryQuerySchema, byPathQuerySchema } from '../types/precision-search.js';
import { createRelationBodySchema } from '../types/knowledge.js';
import type { MemoryController } from '../controllers/index.js';
import type { MemoryRelationController } from '../controllers/knowledge.controller.js';
import { ValidationError } from '../types/errors.js';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const relationIdParamSchema = z.object({
  id: z.string().uuid(),
  relationId: z.string().uuid(),
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

function validateQuery<T extends z.ZodType>(schema: T) {
  return async (request: { query: unknown }): Promise<void> => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.query = result.data;
  };
}

function validateParams<T extends z.ZodType>(schema: T) {
  return async (request: { params: unknown }): Promise<void> => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten());
    }
    request.params = result.data;
  };
}

export async function memoryRoutes(
  fastify: FastifyInstance,
  controller: MemoryController,
  relationController?: MemoryRelationController,
): Promise<void> {
  fastify.get(
    '/memory/by-codename/:codename',
    {
      schema: { tags: ['Knowledge'], summary: 'Get memory by codename' },
    },
    controller.getByCodename.bind(controller),
  );

  fastify.get(
    '/memory/by-slug/:slug',
    {
      schema: { tags: ['Knowledge'], summary: 'Get memory by slug' },
    },
    controller.getBySlug.bind(controller),
  );

  if (relationController) {
    fastify.get(
      '/memory/:id/relations',
      {
        preValidation: [validateParams(idParamSchema)],
        schema: { tags: ['Knowledge'], summary: 'List memory relations' },
      },
      relationController.list.bind(relationController),
    );

    fastify.post(
      '/memory/:id/relations',
      {
        preValidation: [validateParams(idParamSchema), validateBody(createRelationBodySchema)],
        schema: { tags: ['Knowledge'], summary: 'Create memory relation' },
      },
      relationController.create.bind(relationController),
    );

    fastify.delete(
      '/memory/:id/relations/:relationId',
      {
        preValidation: [validateParams(relationIdParamSchema)],
        schema: { tags: ['Knowledge'], summary: 'Delete memory relation' },
      },
      relationController.delete.bind(relationController),
    );
  }

  fastify.post(
    '/memory',
    {
      preValidation: [validateBody(createMemorySchema)],
      schema: {
        tags: ['Memory'],
        summary: 'Create a new memory',
      },
    },
    controller.create.bind(controller),
  );

  fastify.get(
    '/memory/:id',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: {
        tags: ['Memory'],
        summary: 'Get memory by ID',
        params: {
          type: 'object',
          properties: { id: { type: 'string', format: 'uuid' } },
        },
      },
    },
    controller.getById.bind(controller),
  );

  fastify.put(
    '/memory/:id',
    {
      preValidation: [validateParams(idParamSchema), validateBody(updateMemorySchema)],
      schema: {
        tags: ['Memory'],
        summary: 'Update memory',
      },
    },
    controller.update.bind(controller),
  );

  fastify.delete(
    '/memory/:id',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: {
        tags: ['Memory'],
        summary: 'Delete memory',
      },
    },
    controller.delete.bind(controller),
  );

  fastify.get(
    '/memory',
    {
      preValidation: [validateQuery(listMemoriesQuerySchema)],
      schema: {
        tags: ['Memory'],
        summary: 'List memories',
      },
    },
    controller.list.bind(controller),
  );

  fastify.get(
    '/search',
    {
      preValidation: [validateQuery(searchQuerySchema)],
      schema: {
        tags: ['Search'],
        summary: 'Search memories with relevance ranking',
      },
    },
    controller.search.bind(controller),
  );

  fastify.get(
    '/memory/similar',
    {
      preValidation: [validateQuery(similarMemoryQuerySchema)],
      schema: {
        tags: ['Search'],
        summary: 'Find memories similar to a target memory',
      },
    },
    controller.findSimilar.bind(controller),
  );

  fastify.get(
    '/memory/by-path',
    {
      preValidation: [validateQuery(byPathQuerySchema)],
      schema: {
        tags: ['Search'],
        summary: 'Read memory by vault source path',
      },
    },
    controller.getByPath.bind(controller),
  );

  fastify.get(
    '/projects',
    {
      schema: { tags: ['Memory'], summary: 'List all projects' },
    },
    controller.listProjects.bind(controller),
  );

  fastify.get(
    '/tags',
    {
      schema: { tags: ['Memory'], summary: 'List all tags' },
    },
    controller.listTags.bind(controller),
  );

  fastify.post(
    '/memory/:id/favorite',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: {
        tags: ['Memory'],
        summary: 'Toggle favorite status',
      },
    },
    controller.toggleFavorite.bind(controller),
  );

  fastify.post(
    '/memory/:id/archive',
    {
      preValidation: [validateParams(idParamSchema)],
      schema: {
        tags: ['Memory'],
        summary: 'Archive memory',
      },
    },
    controller.archive.bind(controller),
  );
}

export async function backupRoutes(
  fastify: FastifyInstance,
  controller: import('../controllers/index.js').BackupController,
): Promise<void> {
  fastify.get(
    '/backup/export',
    {
      schema: { tags: ['Backup'], summary: 'Export all memories as JSON' },
    },
    controller.export.bind(controller),
  );

  fastify.post(
    '/backup/import',
    {
      preValidation: [validateBody(backupImportSchema)],
      schema: {
        tags: ['Backup'],
        summary: 'Import memories from JSON backup',
      },
    },
    controller.import.bind(controller),
  );
}

export async function healthRoutes(
  fastify: FastifyInstance,
  controller: import('../controllers/index.js').HealthController,
): Promise<void> {
  fastify.get(
    '/',
    {
      schema: { tags: ['Health'], summary: 'API root' },
    },
    controller.root.bind(controller),
  );

  fastify.get(
    '/health',
    {
      schema: { tags: ['Health'], summary: 'Health check' },
    },
    controller.check.bind(controller),
  );
}
