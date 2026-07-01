import type { FastifyInstance } from 'fastify';
import type { KnowledgeController } from '../../controllers/knowledge.controller.js';

export async function knowledgeRoutes(
  fastify: FastifyInstance,
  controller: KnowledgeController,
): Promise<void> {
  fastify.get(
    '/categories',
    { schema: { tags: ['Knowledge'], summary: 'List knowledge categories' } },
    controller.listCategories.bind(controller),
  );

  fastify.get(
    '/memory-types',
    { schema: { tags: ['Knowledge'], summary: 'List memory types' } },
    controller.listMemoryTypes.bind(controller),
  );
}
