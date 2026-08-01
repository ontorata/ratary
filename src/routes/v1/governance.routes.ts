import type { FastifyInstance } from 'fastify';
import type { GovernanceController } from '../../controllers/governance.controller.js';

export async function governanceRoutes(
  fastify: FastifyInstance,
  controller: GovernanceController,
): Promise<void> {
  fastify.get(
    '/governance/manifest',
    {
      schema: {
        tags: ['Governance'],
        summary: 'Memory governance manifest (ADR-1020 / ADR-1021)',
      },
    },
    controller.getManifest.bind(controller),
  );

  fastify.get(
    '/governance/stewardship/runs',
    {
      schema: {
        tags: ['Governance'],
        summary: 'List stewardship run history for authenticated owner',
      },
    },
    controller.listStewardshipRuns.bind(controller),
  );

  fastify.get(
    '/governance/stewardship/runs/:runId',
    {
      schema: {
        tags: ['Governance'],
        summary: 'Stewardship run detail for authenticated owner',
      },
    },
    controller.getStewardshipRun.bind(controller),
  );
}
