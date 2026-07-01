import type { FastifyInstance } from 'fastify';
import type { HealthController } from '../../controllers/index.js';
import type { MemoryController } from '../../controllers/index.js';
import type { BackupController } from '../../controllers/index.js';
import type { AuthController } from '../../controllers/auth.controller.js';
import { healthRoutes, memoryRoutes, backupRoutes } from '../index.js';
import { authRoutes } from './auth.routes.js';

export async function registerV1Routes(
  fastify: FastifyInstance,
  controllers: {
    health: HealthController;
    memory: MemoryController;
    backup: BackupController;
    auth: AuthController;
  },
): Promise<void> {
  await healthRoutes(fastify, controllers.health);
  await memoryRoutes(fastify, controllers.memory);
  await backupRoutes(fastify, controllers.backup);
  await authRoutes(fastify, controllers.auth);
}
