import type { FastifyInstance } from 'fastify';
import type { HealthController } from '../../controllers/index.js';
import type { MemoryController } from '../../controllers/index.js';
import type { BackupController } from '../../controllers/index.js';
import type { AuthController } from '../../controllers/auth.controller.js';
import type { KnowledgeController } from '../../controllers/knowledge.controller.js';
import type { MemoryRelationController } from '../../controllers/knowledge.controller.js';
import type { ContextController } from '../../controllers/context.controller.js';
import { healthRoutes, memoryRoutes, backupRoutes } from '../index.js';
import { authRoutes } from './auth.routes.js';
import { knowledgeRoutes } from './knowledge.routes.js';
import { contextRoutes } from './context.routes.js';

export async function registerV1Routes(
  fastify: FastifyInstance,
  controllers: {
    health: HealthController;
    memory: MemoryController;
    backup: BackupController;
    auth: AuthController;
    knowledge: KnowledgeController;
    relations: MemoryRelationController;
    context: ContextController;
  },
): Promise<void> {
  await healthRoutes(fastify, controllers.health);
  await knowledgeRoutes(fastify, controllers.knowledge);
  await contextRoutes(fastify, controllers.context);
  await memoryRoutes(fastify, controllers.memory, controllers.relations);
  await backupRoutes(fastify, controllers.backup);
  await authRoutes(fastify, controllers.auth);
}
