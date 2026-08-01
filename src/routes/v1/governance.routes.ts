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

  fastify.get(
    '/governance/exceptions',
    {
      schema: {
        tags: ['Governance'],
        summary: 'List governance exception requests for authenticated owner (ADR-1029)',
      },
    },
    controller.listGovernanceExceptions.bind(controller),
  );

  fastify.get(
    '/governance/exceptions/:exceptionId',
    {
      schema: {
        tags: ['Governance'],
        summary: 'Governance exception request detail',
      },
    },
    controller.getGovernanceException.bind(controller),
  );

  fastify.post(
    '/governance/exceptions',
    {
      schema: {
        tags: ['Governance'],
        summary: 'Create Owner-initiated governance exception request (pending — no auto-approve)',
      },
    },
    controller.createGovernanceExceptionRequest.bind(controller),
  );
}
