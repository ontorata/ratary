import type { FastifyInstance } from 'fastify';
import type { GlobalIntelligenceController } from '../../controllers/global-intelligence.controller.js';

export async function globalIntelligenceRoutes(
  fastify: FastifyInstance,
  controller: GlobalIntelligenceController,
): Promise<void> {
  fastify.get('/intelligence/status', controller.getStatus.bind(controller));
  fastify.get('/intelligence/manifest', controller.getManifest.bind(controller));
  fastify.get('/intelligence/analytics/adoption', controller.getAdoption.bind(controller));
  fastify.get('/intelligence/analytics/workspace-health', controller.getWorkspaceHealth.bind(controller));
  fastify.get('/intelligence/analytics/cost', controller.getCost.bind(controller));
  fastify.get('/intelligence/analytics/context-effectiveness', controller.getContextEffectiveness.bind(controller));
  fastify.get('/intelligence/sync/status', controller.getSyncStatus.bind(controller));
  fastify.post('/intelligence/sync', controller.runSync.bind(controller));
}
