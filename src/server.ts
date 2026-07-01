import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getD1Client } from './db/index.js';
import { MemoryRepository } from './repositories/index.js';
import { MemoryService } from './services/index.js';
import {
  createHealthController,
  createMemoryController,
  createBackupController,
  createAuthController,
} from './controllers/index.js';
import { registerV1Routes } from './routes/v1/index.js';
import { healthRoutes, memoryRoutes, backupRoutes } from './routes/index.js';
import { errorHandlerPlugin } from './plugins/index.js';
import { getEnv } from './config/index.js';
import { createAuthLayer } from './auth/index.js';

export interface AppDependencies {
  memoryService: MemoryService;
}

export async function buildApp(options?: {
  logger?: boolean;
  skipAuth?: boolean;
  skipSwagger?: boolean;
}): Promise<FastifyInstance> {
  const env = getEnv();
  const enableLogger = options?.logger ?? env.NODE_ENV !== 'test';

  const isDev = env.NODE_ENV === 'development' && !process.env.VERCEL;

  const fastify = Fastify({
    logger: enableLogger
      ? {
          level: env.LOG_LEVEL,
          transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
        }
      : false,
    genReqId: () => crypto.randomUUID(),
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-Id', 'X-Client-Id'],
  });

  await fastify.register(errorHandlerPlugin);

  const db = getD1Client();
  const authLayer = createAuthLayer(db);

  if (!options?.skipAuth) {
    fastify.addHook('onRequest', authLayer.authenticate);
  }

  const skipSwagger = options?.skipSwagger ?? Boolean(process.env.VERCEL);
  if (!skipSwagger) {
    const { swaggerPlugin } = await import('./plugins/swagger.js');
    await fastify.register(swaggerPlugin);
  }

  const repository = new MemoryRepository(db);
  const memoryService = new MemoryService(repository);

  fastify.decorate('memoryService', memoryService);

  const healthController = createHealthController();
  const memoryController = createMemoryController(memoryService);
  const backupController = createBackupController(memoryService);
  const authController = createAuthController(authLayer.identityService);

  const controllers = {
    health: healthController,
    memory: memoryController,
    backup: backupController,
    auth: authController,
  };

  await fastify.register(async (instance) => {
    await registerV1Routes(instance, controllers);
  }, { prefix: '/api/v1' });

  // Legacy routes (backward compatible dual mount)
  await fastify.register(async (instance) => {
    await healthRoutes(instance, healthController);
    await memoryRoutes(instance, memoryController);
    await backupRoutes(instance, backupController);
  });

  return fastify;
}

declare module 'fastify' {
  interface FastifyInstance {
    memoryService: MemoryService;
  }
}
