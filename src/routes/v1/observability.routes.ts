import type { FastifyInstance } from 'fastify';
import type { ObservabilityController } from '../../controllers/observability.controller.js';

export async function observabilityRoutes(
  fastify: FastifyInstance,
  controller: ObservabilityController,
): Promise<void> {
  fastify.get(
    '/observability/status',
    {
      schema: {
        tags: ['Observability'],
        summary: 'Observability platform layer status (Phase 19)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/observability/dashboards',
    {
      schema: {
        tags: ['Observability'],
        summary: 'List Grafana dashboard packs',
      },
    },
    controller.listDashboards.bind(controller),
  );

  fastify.get(
    '/observability/dashboards/:packId',
    {
      schema: {
        tags: ['Observability'],
        summary: 'Get Grafana dashboard pack JSON',
      },
    },
    controller.getDashboard.bind(controller),
  );

  fastify.get(
    '/observability/slos',
    {
      schema: {
        tags: ['Observability'],
        summary: 'List SLO definitions',
      },
    },
    controller.listSlos.bind(controller),
  );

  fastify.get(
    '/observability/alerts',
    {
      schema: {
        tags: ['Observability'],
        summary: 'List Alertmanager rule templates',
      },
    },
    controller.listAlerts.bind(controller),
  );

  fastify.get(
    '/observability/alerts/export',
    {
      schema: {
        tags: ['Observability'],
        summary: 'Export Alertmanager YAML templates',
      },
    },
    controller.exportAlertmanager.bind(controller),
  );
}
