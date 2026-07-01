import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getD1Client } from './db/index.js';
import { MemoryRepository } from './repositories/index.js';
import { MemoryService } from './services/index.js';
import {
  createHealthController,
  createMemoryController,
  createBackupController,
} from './controllers/index.js';
import { healthRoutes, memoryRoutes, backupRoutes } from './routes/index.js';
import { errorHandlerPlugin, authPlugin, swaggerPlugin } from './plugins/index.js';
import { getEnv } from './config/index.js';

export interface AppDependencies {
  memoryService: MemoryService;
}

export async function buildApp(options?: {
  logger?: boolean;
  skipAuth?: boolean;
}): Promise<FastifyInstance> {
  const env = getEnv();
  const enableLogger = options?.logger ?? env.NODE_ENV !== 'test';

  const fastify = Fastify({
    logger: enableLogger
      ? {
          level: env.LOG_LEVEL,
          transport:
            env.NODE_ENV === 'development'
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
        }
      : false,
    genReqId: () => crypto.randomUUID(),
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-Id'],
  });

  await fastify.register(errorHandlerPlugin);

  if (!options?.skipAuth) {
    await fastify.register(authPlugin);
  }

  await fastify.register(swaggerPlugin);

  const db = getD1Client();
  const repository = new MemoryRepository(db);
  const memoryService = new MemoryService(repository);

  fastify.decorate('memoryService', memoryService);

  const healthController = createHealthController();
  const memoryController = createMemoryController(memoryService);
  const backupController = createBackupController(memoryService);

  await fastify.register(
    async (instance) => {
      await healthRoutes(instance, healthController);
    },
    { prefix: '' },
  );

  await fastify.register(
    async (instance) => {
      await memoryRoutes(instance, memoryController);
    },
    { prefix: '' },
  );

  await fastify.register(
    async (instance) => {
      await backupRoutes(instance, backupController);
    },
    { prefix: '' },
  );

  return fastify;
}

declare module 'fastify' {
  interface FastifyInstance {
    memoryService: MemoryService;
  }
}
