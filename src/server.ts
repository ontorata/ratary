import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getD1Client } from './db/index.js';
import { MemoryRepository } from './repositories/memory.repository.js';
import { MemoryRelationRepository } from './repositories/memory-relation.repository.js';
import { MemoryService } from './services/memory.service.js';
import { MemoryRelationService } from './services/memory-relation.service.js';
import { HealthService } from './services/health.service.js';
import { KnowledgeService } from './knowledge/knowledge.service.js';
import { SearchService } from './search/search.service.js';
import {
  createHealthController,
  createMemoryController,
  createBackupController,
  createAuthController,
} from './controllers/index.js';
import {
  createKnowledgeController,
  createMemoryRelationController,
} from './controllers/knowledge.controller.js';
import { registerV1Routes } from './routes/v1/index.js';
import { healthRoutes } from './routes/index.js';
import { errorHandlerPlugin, observabilityPlugin } from './plugins/index.js';
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-Id', 'X-Client-Id'],
  });

  await fastify.register(errorHandlerPlugin);

  if (enableLogger) {
    await fastify.register(observabilityPlugin);
  }

  const db = getD1Client();
  const authLayer = createAuthLayer(db);

  if (!options?.skipAuth) {
    fastify.addHook('onRequest', authLayer.authenticate);
    fastify.addHook('onRequest', authLayer.enforcePermissions);
  }

  const skipSwagger = options?.skipSwagger ?? Boolean(process.env.VERCEL);
  if (!skipSwagger) {
    const { swaggerPlugin } = await import('./plugins/swagger.js');
    await fastify.register(swaggerPlugin);
  }

  const repository = new MemoryRepository(db);
  const relationRepository = new MemoryRelationRepository(db);
  const knowledgeService = new KnowledgeService(repository);
  const searchService = new SearchService(repository);
  const memoryService = new MemoryService(repository, knowledgeService, searchService);
  const relationService = new MemoryRelationService(relationRepository, repository);
  const healthService = new HealthService(db);

  fastify.decorate('memoryService', memoryService);

  const healthController = createHealthController(healthService);
  const memoryController = createMemoryController(memoryService);
  const backupController = createBackupController(memoryService);
  const authController = createAuthController(authLayer.identityService, authLayer.clientService);
  const knowledgeController = createKnowledgeController(memoryService);
  const relationController = createMemoryRelationController(relationService);

  const controllers = {
    health: healthController,
    memory: memoryController,
    backup: backupController,
    auth: authController,
    knowledge: knowledgeController,
    relations: relationController,
  };

  await fastify.register(
    async (instance) => {
      await registerV1Routes(instance, controllers);
    },
    { prefix: '/api/v1' },
  );

  await fastify.register(async (instance) => {
    await healthRoutes(instance, healthController);
  });

  return fastify;
}

declare module 'fastify' {
  interface FastifyInstance {
    memoryService: MemoryService;
  }
}
