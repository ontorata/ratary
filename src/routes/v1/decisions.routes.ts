import type { FastifyInstance } from 'fastify';
import type { DecisionsController } from '../../controllers/decisions.controller.js';

export async function decisionsRoutes(
  fastify: FastifyInstance,
  controller: DecisionsController,
): Promise<void> {
  fastify.post(
    '/decisions/recommendations',
    {
      schema: {
        tags: ['Decision Intelligence'],
        summary: 'Advisory recommendation cards from recall trace (PI-P6-B / ADR-1042)',
      },
    },
    controller.fetchRecommendations.bind(controller),
  );

  fastify.post(
    '/decisions/provenance',
    {
      schema: {
        tags: ['Decision Intelligence'],
        summary: 'Record human Accept/Reject provenance (ADR-069, flag-gated)',
      },
    },
    controller.recordDecisionProvenance.bind(controller),
  );
}
