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
  },
): Promise<void> {
  await healthRoutes(fastify, controllers.health);
  await capabilitiesRoutes(fastify, controllers.capabilities);
  if (controllers.signals) {
    await signalsRoutes(fastify, controllers.signals);
  }
  if (controllers.evolution) {
    await evolutionRoutes(fastify, controllers.evolution);
  }
  if (controllers.clientSync) {
    await clientSyncRoutes(fastify, controllers.clientSync);
  }
  await knowledgeRoutes(fastify, controllers.knowledge);
  await contextRoutes(fastify, controllers.context);
  await graphRoutes(fastify, controllers.graph);
  await workspaceRoutes(fastify, controllers.workspace);
  await memoryRoutes(fastify, controllers.memory, controllers.relations);
  await backupRoutes(fastify, controllers.backup);
  await authRoutes(fastify, controllers.auth);
}
