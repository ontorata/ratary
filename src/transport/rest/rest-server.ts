import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getD1Client, getPostgresSqlDatabase } from '../../db/index.js';
import { MemoryRepository } from '../../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../repositories/memory-relation.repository.js';
import { createPlatformAdapters } from '../../infrastructure/composition/create-platform-adapters.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../services/create-memory-service.js';
import type { MemoryService } from '../../services/memory.service.js';
import { HealthService } from '../../services/health.service.js';
import {
  createHealthController,
  createMemoryController,
  createBackupController,
  createAuthController,
} from '../../controllers/index.js';
import {
  createKnowledgeController,
  createMemoryRelationController,
} from '../../controllers/knowledge.controller.js';
import { createContextController } from '../../controllers/context.controller.js';
import { createGraphController } from '../../controllers/graph.controller.js';
import { createWorkspaceController } from '../../controllers/workspace.controller.js';
import { createCapabilitiesController } from '../../controllers/capabilities.controller.js';
import { createSignalsController } from '../../controllers/signals.controller.js';
import { createSignalIngestPorts } from '../../composition/create-signal-ingest-ports.js';
import { createLearningPorts } from '../../composition/create-learning-ports.js';
import { createInspectionLedgerPorts } from '../../composition/create-inspection-ledger-ports.js';
import { createInspectionLedgerController } from '../../controllers/inspection-ledger.controller.js';
import { createMemoryEvolutionPorts } from '../../composition/create-memory-evolution-ports.js';
import { createEventPipelinePorts } from '../../composition/create-event-pipeline-ports.js';
import { createEvolutionController } from '../../controllers/evolution.controller.js';
import { createClientSyncController } from '../../controllers/client-sync.controller.js';
import { createGraphService } from '../../services/graph.service.js';
import { createContextService } from '../../memory/create-context-service.js';
import { createMemoryAccessAuditor } from '../../infrastructure/composition/create-memory-access-auditor.js';
import { createEmbeddingProvider } from '../../embedding/create-embedding-provider.js';
import { registerV1Routes } from '../../routes/v1/index.js';
import { healthRoutes } from '../../routes/index.js';
import { errorHandlerPlugin, observabilityPlugin } from '../../plugins/index.js';
import {
  isOpenTelemetryEnabled,
  openTelemetryFastifyPlugin,
  registerOpenTelemetry,
} from '../../infrastructure/observability/opentelemetry/index.js';
import { getEnv } from '../../config/index.js';
import { createAuthLayer } from '../../auth/index.js';
import { createMultiAiPorts } from '../../composition/create-multi-ai-ports.js';
import type { MultiAiPorts } from '../../composition/create-multi-ai-ports.js';
import { createWorkspaceMembershipMiddleware } from '../../auth/workspace-membership.middleware.js';
import type { PlatformAdapters } from '../../infrastructure/composition/create-platform-adapters.js';
import { createTransportHandlers, type TransportHandlers } from '../shared/handlers/create-transport-handlers.js';
import { createCapabilitiesHandlers } from '../shared/handlers/capabilities.handlers.js';
import { createFederationPorts } from '../../composition/create-federation-ports.js';
import { createSecurityPorts } from '../../composition/create-security-ports.js';
import { createFederationController } from '../../controllers/federation.controller.js';
import { createEcosystemController } from '../../controllers/ecosystem.controller.js';
import {
  createSecurityController,
  createSsoController,
} from '../../controllers/security.controller.js';
import { createCloudPorts } from '../../composition/create-cloud-ports.js';
import { createCloudController } from '../../controllers/cloud.controller.js';
import { createObservabilityPorts } from '../../composition/create-observability-ports.js';
import { createObservabilityController } from '../../controllers/observability.controller.js';
import { createInfrastructurePlatformPorts } from '../../composition/create-infrastructure-platform-ports.js';
import { createInfrastructureController } from '../../controllers/infrastructure.controller.js';
import { createSearchGraphPorts } from '../../composition/create-search-graph-ports.js';
import { createSearchGraphController } from '../../controllers/search-graph.controller.js';
import { createContentScalePorts } from '../../composition/create-content-scale-ports.js';
import { createContentScaleController } from '../../controllers/content-scale.controller.js';
import { createKnowledgeFabricPorts } from '../../composition/create-knowledge-fabric-ports.js';
import { createKnowledgeFabricController } from '../../controllers/knowledge-fabric.controller.js';
import { createAiBrainPlatformPorts } from '../../composition/create-ai-brain-platform-ports.js';
import { createAiBrainPlatformController } from '../../controllers/ai-brain-platform.controller.js';
import { createGlobalIntelligencePorts } from '../../composition/create-global-intelligence-ports.js';
import { createGlobalIntelligenceController } from '../../controllers/global-intelligence.controller.js';
import { createCompressionAdminController } from '../../controllers/compression-admin.controller.js';
import { EmbeddingJobRunner } from '../../embedding/embedding-job.runner.js';

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

  const observabilityPorts = createObservabilityPorts(env);
  if (observabilityPorts.enabled) {
    observabilityPorts.registerMiddleware(fastify);
  }

  if (enableLogger) {
    await fastify.register(observabilityPlugin);
  }

  if (isOpenTelemetryEnabled(env)) {
    await fastify.register(openTelemetryFastifyPlugin);
  }

  const injectedSql = getPostgresSqlDatabase();
  const d1 = injectedSql ? null : env.SQL_PROVIDER === 'd1' ? getD1Client() : null;
  const platform = createPlatformAdapters(d1, env, injectedSql ?? undefined);
  const infrastructurePorts = await createInfrastructurePlatformPorts(platform.sql, env);
  const searchGraphPorts = createSearchGraphPorts(platform.sql, env);
  const authLayer = createAuthLayer(platform.sql);
  const securityPorts = createSecurityPorts(platform.sql, env);

  if (!options?.skipAuth) {
    fastify.addHook('onRequest', authLayer.authenticate);
    fastify.addHook('onRequest', authLayer.enforcePermissions);
    if (env.ENTERPRISE_RBAC) {
      fastify.addHook(
        'onRequest',
        createWorkspaceMembershipMiddleware(platform.workspaceMembership),
      );
    }
    if (securityPorts.enabled) {
      fastify.addHook('onRequest', securityPorts.policyMiddleware);
      fastify.addHook('onRequest', securityPorts.quotaMiddleware);
    }
  }

  const skipSwagger = options?.skipSwagger ?? Boolean(process.env.VERCEL);
  if (!skipSwagger) {
    const { swaggerPlugin } = await import('../../plugins/swagger.js');
    await fastify.register(swaggerPlugin);
  }

  const repository = new MemoryRepository(platform.sql);
  const relationRepository = new MemoryRelationRepository(platform.sql);
  const multiAi = createMultiAiPorts(platform.sql, env);
  const { scopeResolver } = multiAi;
  const evolutionPorts = createMemoryEvolutionPorts(platform.sql, env);
  let memoryServiceRef: MemoryService | null = null;
  const cloudPorts = createCloudPorts(platform.sql, env, {
    identityService: authLayer.identityService,
    exportBackup: (scope) => {
      if (!memoryServiceRef) return Promise.resolve({ memories: [] });
      return memoryServiceRef.exportBackup(scope);
    },
  });
  if (observabilityPorts.enabled) {
    observabilityPorts.registerMetricsRoute(fastify, {
      usageMeter: cloudPorts.usageMeter,
      usageMeterEnabled: cloudPorts.usageMeterEnabled,
    });
  }
  const aiBrainPlatformPorts = createAiBrainPlatformPorts(platform.sql, env);
  const globalIntelligencePorts = createGlobalIntelligencePorts(
    platform.sql,
    env,
    observabilityPorts.metricsExporter,
    {
      usageMeter: cloudPorts.usageMeter,
      usageMeterEnabled: cloudPorts.usageMeterEnabled,
    },
  );
  const eventConsumers = [
    ...cloudPorts.eventConsumers,
    ...(aiBrainPlatformPorts.webhookConsumer ? [aiBrainPlatformPorts.webhookConsumer] : []),
    ...(globalIntelligencePorts.telemetryConsumer ? [globalIntelligencePorts.telemetryConsumer] : []),
  ];
  const eventPipeline = createEventPipelinePorts(
    env,
    platform.eventBus,
    platform.analyticsStore,
    eventConsumers,
  );
  const memoryService = createMemoryService(
    platform.sql,
    repository,
    multiAi,
    evolutionPorts.coordinator,
    eventPipeline.coordinator,
  );
  memoryServiceRef = memoryService;
  const clientSyncService = multiAi.bindClientSyncService(memoryService);
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
  const embeddingProvider = createEmbeddingProvider({
    usageMeter: cloudPorts.usageMeter,
    usageMeterEnabled: cloudPorts.usageMeterEnabled,
  });
  const embeddingJobRunner = new EmbeddingJobRunner(
    repository,
    repository,
    embeddingProvider,
    platform.embeddingStore,
  );
  const contentScalePorts = createContentScalePorts(platform.sql, env, {
    objectStorage: platform.objectStorage,
    vectorStore: platform.vectorStore,
    embeddingJobRunner,
  });
  const knowledgeFabricPorts = createKnowledgeFabricPorts(platform.sql, env, memoryService);
  const memoryAccessAuditor = eventPipeline.wrapMemoryAccessAuditor(
    createMemoryAccessAuditor(env, platform.sql),
  );
  const contextService = createContextService(repository, {
    embeddingProvider,
    vectorStore: platform.vectorStore,
    sql: platform.sql,
    memoryAccessAuditor,
  });
  const contextController = createContextController(contextService, scopeResolver);
  const graphService = createGraphService(platform.sql, repository);
  const graphController = createGraphController(graphService, scopeResolver);
  const workspaceController = createWorkspaceController(
    platform.sql,
    scopeResolver,
    multiAi.agentIdentity,
  );
  const capabilitiesController = createCapabilitiesController(
    env,
    createCapabilitiesHandlers({
      env,
      infrastructurePorts,
      searchGraphPorts,
      contentScalePorts,
      knowledgeFabricPorts,
      aiBrainPlatformPorts,
      globalIntelligencePorts,
    }),
  );
  const learningPorts = createLearningPorts(platform.sql, env);
  const inspectionLedgerPorts = createInspectionLedgerPorts(platform.sql, env);
  const signalPorts = createSignalIngestPorts(platform.sql, env, {
    eventBus: platform.eventBus,
    learningPorts,
  });
  const signalsController = signalPorts.enabled
    ? createSignalsController(scopeResolver, signalPorts.ingestDeps)
    : undefined;
  const inspectionLedgerController =
    inspectionLedgerPorts.enabled && inspectionLedgerPorts.patternStore
      ? createInspectionLedgerController(scopeResolver, inspectionLedgerPorts.patternStore)
      : undefined;
  const evolutionController =
    evolutionPorts.enabled && evolutionPorts.service
      ? createEvolutionController(scopeResolver, evolutionPorts.service)
      : undefined;
  const clientSyncController = multiAi.clientSync.enabled
    ? createClientSyncController(scopeResolver, clientSyncService)
    : undefined;

  const federationPorts = createFederationPorts(platform.sql, env);
  const federationService = federationPorts.createService(memoryService);
  if (globalIntelligencePorts.enabled) {
    globalIntelligencePorts.bindExchange(memoryService, () => federationService);
  }
  const federationController = federationPorts.enabled
    ? createFederationController(scopeResolver, federationService)
    : undefined;
  const ecosystemController = createEcosystemController(env);
  const securityController = securityPorts.enabled
    ? createSecurityController(env, securityPorts)
    : undefined;
  const ssoController = securityPorts.enabled ? createSsoController(securityPorts) : undefined;
  const cloudController = cloudPorts.enabled
    ? createCloudController(env, cloudPorts, scopeResolver)
    : undefined;
  const observabilityController = observabilityPorts.enabled
    ? createObservabilityController(env, observabilityPorts)
    : undefined;
  const infrastructureController = infrastructurePorts.enabled
    ? createInfrastructureController(env, infrastructurePorts, observabilityPorts.metricsExporter)
    : undefined;
  const searchGraphController = searchGraphPorts.enabled
    ? createSearchGraphController(env, searchGraphPorts, observabilityPorts.metricsExporter)
    : undefined;
  const contentScaleController = contentScalePorts.enabled
    ? createContentScaleController(env, contentScalePorts, observabilityPorts.metricsExporter)
    : undefined;
  const knowledgeFabricController = knowledgeFabricPorts.enabled
    ? createKnowledgeFabricController(
        env,
        knowledgeFabricPorts,
        scopeResolver,
        observabilityPorts.metricsExporter,
      )
    : undefined;
  const aiBrainPlatformController = aiBrainPlatformPorts.enabled
    ? createAiBrainPlatformController(env, aiBrainPlatformPorts, scopeResolver)
    : undefined;
  const globalIntelligenceController = globalIntelligencePorts.enabled
    ? createGlobalIntelligenceController(env, globalIntelligencePorts, scopeResolver)
    : undefined;
  const compressionAdminController = createCompressionAdminController(
    scopeResolver,
    platform.sql,
    env,
  );

  const transportHandlers = createTransportHandlers({
    memoryService,
    contextService,
    graphService,
    relationService,
    scopeResolver,
    env,
    infrastructurePorts,
    searchGraphPorts,
    contentScalePorts,
    knowledgeFabricPorts,
    aiBrainPlatformPorts,
    globalIntelligencePorts,
    signalIngest: signalPorts.enabled ? { enabled: true, ...signalPorts.ingestDeps } : undefined,
  });

  fastify.decorate('transportHandlers', transportHandlers);

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
    capabilities: capabilitiesController,
    signals: signalsController,
    inspectionLedger: inspectionLedgerController,
    evolution: evolutionController,
    clientSync: clientSyncController,
    federation: federationController,
    ecosystem: ecosystemController,
    security: securityController,
    sso: ssoController,
    cloud: cloudController,
    observability: observabilityController,
    infrastructure: infrastructureController,
    searchGraph: searchGraphController,
    contentScale: contentScaleController,
    knowledgeFabric: knowledgeFabricController,
    aiBrainPlatform: aiBrainPlatformController,
    globalIntelligence: globalIntelligenceController,
    compressionAdmin: compressionAdminController,
  };

  await fastify.register(
    async (instance) => {
      await registerV1Routes(instance, controllers);
      if (env.SSE_ENABLED) {
        const { registerSseRoutes } = await import('../sse/register-sse-routes.js');
        await registerSseRoutes(instance, { handlers: transportHandlers.context });
      }
    },
    { prefix: '/api/v1' },
  );

  if (env.REMOTE_MCP_ENABLED) {
    const { registerRemoteMcpRoutes } = await import('../mcp/remote/register-remote-mcp-routes.js');
    await registerRemoteMcpRoutes(fastify, {
      env,
      handlers: transportHandlers,
      scopeResolver,
      agentIdentity: multiAi.agentIdentity,
      sql: platform.sql,
      path: env.REMOTE_MCP_PATH,
      corsOrigins: env.REMOTE_MCP_CORS_ORIGINS,
    });
    if (env.REMOTE_MCP_OAUTH_ENABLED) {
      const { registerRemoteMcpOAuthRoutes } = await import(
        '../mcp/remote/register-remote-mcp-oauth-routes.js'
      );
      await registerRemoteMcpOAuthRoutes(fastify, env);
    }
  }

  if (env.WEBSOCKET_ENABLED) {
    const { WebSocketTransportServer } = await import('../websocket/websocket-transport-server.js');
    const wsServer = new WebSocketTransportServer(fastify.server, {
      handlers: transportHandlers,
      scopeResolver,
    });
    fastify.addHook('onReady', async () => {
      await wsServer.start();
    });
    fastify.addHook('onClose', async () => {
      await wsServer.stop();
    });
  }

  await fastify.register(async (instance) => {
    await healthRoutes(instance, healthController);
  });

  if (eventPipeline.runner) {
    await eventPipeline.runner.start();
    fastify.addHook('onClose', async () => {
      await eventPipeline.runner!.stop();
    });
  }

  return fastify;
}

declare module 'fastify' {
  interface FastifyInstance {
    memoryService: MemoryService;
    multiAi: MultiAiPorts;
    transportHandlers: TransportHandlers;
  }
}
