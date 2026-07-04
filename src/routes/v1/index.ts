import type { FastifyInstance } from 'fastify';
import type { HealthController } from '../../controllers/index.js';
import type { MemoryController } from '../../controllers/index.js';
import type { BackupController } from '../../controllers/index.js';
import type { AuthController } from '../../controllers/auth.controller.js';
import type { KnowledgeController } from '../../controllers/knowledge.controller.js';
import type { MemoryRelationController } from '../../controllers/knowledge.controller.js';
import type { ContextController } from '../../controllers/context.controller.js';
import type { GraphController } from '../../controllers/graph.controller.js';
import type { WorkspaceController } from '../../controllers/workspace.controller.js';
import type { CapabilitiesController } from '../../controllers/capabilities.controller.js';
import type { SignalsController } from '../../controllers/signals.controller.js';
import type { EvolutionController } from '../../controllers/evolution.controller.js';
import type { ClientSyncController } from '../../controllers/client-sync.controller.js';
import type { FederationController } from '../../controllers/federation.controller.js';
import type { EcosystemController } from '../../controllers/ecosystem.controller.js';
import type { SecurityController } from '../../controllers/security.controller.js';
import type { SsoController } from '../../controllers/security.controller.js';
import type { CloudController } from '../../controllers/cloud.controller.js';
import type { ObservabilityController } from '../../controllers/observability.controller.js';
import type { InfrastructureController } from '../../controllers/infrastructure.controller.js';
import type { SearchGraphController } from '../../controllers/search-graph.controller.js';
import type { ContentScaleController } from '../../controllers/content-scale.controller.js';
import type { KnowledgeFabricController } from '../../controllers/knowledge-fabric.controller.js';
import type { AiBrainPlatformController } from '../../controllers/ai-brain-platform.controller.js';
import type { GlobalIntelligenceController } from '../../controllers/global-intelligence.controller.js';
import type { CompressionAdminController } from '../../controllers/compression-admin.controller.js';
import { healthRoutes, memoryRoutes, backupRoutes } from '../index.js';
import { authRoutes } from './auth.routes.js';
import { knowledgeRoutes } from './knowledge.routes.js';
import { contextRoutes } from './context.routes.js';
import { graphRoutes } from './graph.routes.js';
import { workspaceRoutes } from './workspace.routes.js';
import { capabilitiesRoutes } from './capabilities.routes.js';
import { signalsRoutes } from './signals.routes.js';
import { evolutionRoutes } from './evolution.routes.js';
import { clientSyncRoutes } from './client-sync.routes.js';
import { federationRoutes } from './federation.routes.js';
import { ecosystemRoutes } from './ecosystem.routes.js';
import { securityRoutes } from './security.routes.js';
import { ssoRoutes } from './sso.routes.js';
import { cloudRoutes } from './cloud.routes.js';
import { observabilityRoutes } from './observability.routes.js';
import { infrastructureRoutes } from './infrastructure.routes.js';
import { searchGraphRoutes } from './search-graph.routes.js';
import { contentScaleRoutes } from './content-scale.routes.js';
import { knowledgeFabricRoutes } from './knowledge-fabric.routes.js';
import { aiBrainPlatformRoutes } from './ai-brain-platform.routes.js';
import { globalIntelligenceRoutes } from './global-intelligence.routes.js';
import { adminCompressionRoutes } from './admin-compression.routes.js';

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
    graph: GraphController;
    workspace: WorkspaceController;
    capabilities: CapabilitiesController;
    signals?: SignalsController;
    evolution?: EvolutionController;
    clientSync?: ClientSyncController;
    federation?: FederationController;
    ecosystem: EcosystemController;
    security?: SecurityController;
    sso?: SsoController;
    cloud?: CloudController;
    observability?: ObservabilityController;
    infrastructure?: InfrastructureController;
    searchGraph?: SearchGraphController;
    contentScale?: ContentScaleController;
    knowledgeFabric?: KnowledgeFabricController;
    aiBrainPlatform?: AiBrainPlatformController;
    globalIntelligence?: GlobalIntelligenceController;
    compressionAdmin: CompressionAdminController;
  },
): Promise<void> {
  await healthRoutes(fastify, controllers.health);
  await capabilitiesRoutes(fastify, controllers.capabilities);
  await adminCompressionRoutes(fastify, controllers.compressionAdmin);
  await ecosystemRoutes(fastify, controllers.ecosystem);
  if (controllers.security) {
    await securityRoutes(fastify, controllers.security);
  }
  if (controllers.sso) {
    await ssoRoutes(fastify, controllers.sso);
  }
  if (controllers.signals) {
    await signalsRoutes(fastify, controllers.signals);
  }
  if (controllers.evolution) {
    await evolutionRoutes(fastify, controllers.evolution);
  }
  if (controllers.clientSync) {
    await clientSyncRoutes(fastify, controllers.clientSync);
  }
  if (controllers.federation) {
    await federationRoutes(fastify, controllers.federation);
  }
  if (controllers.cloud) {
    await cloudRoutes(fastify, controllers.cloud);
  }
  if (controllers.observability) {
    await observabilityRoutes(fastify, controllers.observability);
  }
  if (controllers.infrastructure) {
    await infrastructureRoutes(fastify, controllers.infrastructure);
  }
  if (controllers.searchGraph) {
    await searchGraphRoutes(fastify, controllers.searchGraph);
  }
  if (controllers.contentScale) {
    await contentScaleRoutes(fastify, controllers.contentScale);
  }
  if (controllers.knowledgeFabric) {
    await knowledgeFabricRoutes(fastify, controllers.knowledgeFabric);
  }
  if (controllers.aiBrainPlatform) {
    await aiBrainPlatformRoutes(fastify, controllers.aiBrainPlatform);
  }
  if (controllers.globalIntelligence) {
    await globalIntelligenceRoutes(fastify, controllers.globalIntelligence);
  }
  await knowledgeRoutes(fastify, controllers.knowledge);
  await contextRoutes(fastify, controllers.context);
  await graphRoutes(fastify, controllers.graph);
  await workspaceRoutes(fastify, controllers.workspace);
  await memoryRoutes(fastify, controllers.memory, controllers.relations);
  await backupRoutes(fastify, controllers.backup);
  await authRoutes(fastify, controllers.auth);
}
