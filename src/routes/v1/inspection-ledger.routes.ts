import type { FastifyInstance } from 'fastify';
import type { InspectionLedgerController } from '../../controllers/inspection-ledger.controller.js';

export async function inspectionLedgerRoutes(
  fastify: FastifyInstance,
  controller: InspectionLedgerController,
): Promise<void> {
  fastify.get(
    '/inspection-patterns',
    {
      schema: {
        tags: ['Inspection Ledger'],
        summary: 'List inspection pattern ledger entries for recall',
      },
    },
    controller.list.bind(controller),
  );
}
