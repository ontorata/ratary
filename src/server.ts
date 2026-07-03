import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getD1Client } from './db/index.js';
import { MemoryRepository } from './repositories/memory.repository.js';
import { MemoryRelationRepository } from './repositories/memory-relation.repository.js';
import { createPlatformAdapters } from './infrastructure/composition/create-platform-adapters.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from './services/create-memory-service.js';
import type { MemoryService } from './services/memory.service.js';
import { HealthService } from './services/health.service.js';
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
import { createContextController } from './controllers/context.controller.js';
import { createGraphController } from './controllers/graph.controller.js';
import { createWorkspaceController } from './controllers/workspace.controller.js';
import { createGraphService } from './services/graph.service.js';
import { createContextService } from './memory/create-context-service.js';
import { createEmbeddingProvider } from './embedding/create-embedding-provider.js';
import { registerV1Routes } from './routes/v1/index.js';
import { healthRoutes } from './routes/index.js';
import { errorHandlerPlugin, observabilityPlugin } from './plugins/index.js';
import {
  isOpenTelemetryEnabled,
  openTelemetryFastifyPlugin,
  registerOpenTelemetry,
} from './infrastructure/observability/opentelemetry/index.js';
import { getEnv } from './config/index.js';
import { createAuthLayer } from './auth/index.js';
import { createMultiAiPorts } from './composition/create-multi-ai-ports.js';
import type { MultiAiPorts } from './composition/create-multi-ai-ports.js';
import { createWorkspaceMembershipMiddleware } from './auth/workspace-membership.middleware.js';
import type { PlatformAdapters } from './infrastructure/composition/create-platform-adapters.js';

export interface AppDependencies {
  memoryService: MemoryService;
  multiAi: MultiAiPorts;
  platform: PlatformAdapters;
}

export async function buildApp(options?: {
  logger?: boolean;
  skipAuth?: boolean;
  skipSwagger?: boolean;
}): Promise<FastifyInstance> {
  const env = getEnv();
  const enableLogger = options?.logger ?? env.NODE_ENV !== 'test';

  if (isOpenTelemetryEnabled(env)) {
    registerOpenTelemetry(env);
  }

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
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-Id',
      'X-Client-Id',
      'X-Workspace-Id',
      'X-Agent-Id',
    ],
  });

  await fastify.register(errorHandlerPlugin);

  if (enableLogger) {
    await fastify.register(observabilityPlugin);
  }

  if (isOpenTelemetryEnabled(env)) {
    await fastify.register(openTelemetryFastifyPlugin);
  }

  const d1 = env.SQL_PROVIDER === 'd1' ? getD1Client() : null;
  const platform = createPlatformAdapters(d1, env);
  const authLayer = createAuthLayer(platform.sql);

  if (!options?.skipAuth) {
    fastify.addHook('onRequest', authLayer.authenticate);
    fastify.addHook('onRequest', authLayer.enforcePermissions);
    if (env.ENTERPRISE_RBAC) {
      fastify.addHook('onRequest', createWorkspaceMembershipMiddleware(platform.workspaceMembership));
    }
  }

  const skipSwagger = options?.skipSwagger ?? Boolean(process.env.VERCEL);
  if (!skipSwagger) {
    const { swaggerPlugin } = await import('./plugins/swagger.js');
    await fastify.register(swaggerPlugin);
  }

  const repository = new MemoryRepository(platform.sql);
  const relationRepository = new MemoryRelationRepository(platform.sql);
  const multiAi = createMultiAiPorts(platform.sql);
  const { scopeResolver } = multiAi;
  const memoryService = createMemoryService(platform.sql, repository, multiAi);
  const relationService = createMemoryRelationService(platform.sql, repository, relationRepository);
  const healthService = new HealthService(platform.sql);

  fastify.decorate('memoryService', memoryService);
  fastify.decorate('multiAi', multiAi);

  const healthController = createHealthController(healthService);
  const memoryController = createMemoryController(memoryService, scopeResolver);
  const backupController = createBackupController(memoryService, scopeResolver);
  const authController = createAuthController(authLayer.identityService, authLayer.clientService);
  const knowledgeController = createKnowledgeController(memoryService, scopeResolver);
  const relationController = createMemoryRelationController(relationService, scopeResolver);
  const embeddingProvider = createEmbeddingProvider();
  const contextService = createContextService(repository, {
    embeddingProvider,
    vectorStore: platform.vectorStore,
    sql: platform.sql,
  });
  const contextController = createContextController(contextService, scopeResolver);
  const graphService = createGraphService(platform.sql, repository);
  const graphController = createGraphController(graphService, scopeResolver);
  const workspaceController = createWorkspaceController(platform.sql, scopeResolver, multiAi.agentIdentity);

  const controllers = {
    health: healthController,
    memory: memoryController,
    backup: backupController,
    auth: authController,
    knowledge: knowledgeController,
    relations: relationController,
    context: contextController,
    graph: graphController,
    workspace: workspaceController,
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
    multiAi: MultiAiPorts;
  }
}
