import type { FastifyInstance } from 'fastify';
import type { CloudController } from '../../controllers/cloud.controller.js';

export async function cloudRoutes(
  fastify: FastifyInstance,
  controller: CloudController,
): Promise<void> {
  fastify.get(
    '/cloud/status',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Cloud platform layer status (Phase 18)',
      },
    },
    controller.getStatus.bind(controller),
  );

  fastify.get(
    '/cloud/regions',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'List registered cloud regions',
      },
    },
    controller.listRegions.bind(controller),
  );

  fastify.post(
    '/cloud/workspaces/provision',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Provision workspace metadata under organization',
      },
    },
    controller.provisionWorkspace.bind(controller),
  );

  fastify.post(
    '/cloud/workspaces/deprovision',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Soft-deprovision workspace metadata',
      },
    },
    controller.deprovisionWorkspace.bind(controller),
  );

  fastify.post(
    '/cloud/workspaces/:workspaceId/region',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Assign primary/secondary region for workspace',
      },
    },
    controller.assignRegion.bind(controller),
  );

  fastify.get(
    '/cloud/workspaces/:workspaceId/topology',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Get tenant topology including federation peers',
      },
    },
    controller.getTopology.bind(controller),
  );

  fastify.post(
    '/cloud/identities/:identityId/rotate-key',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Rotate API key via control plane lifecycle hook',
      },
    },
    controller.rotateApiKey.bind(controller),
  );

  fastify.get(
    '/cloud/usage/export',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Export usage records for billing',
      },
    },
    controller.exportUsage.bind(controller),
  );

  fastify.get(
    '/cloud/usage/aggregate',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Aggregate usage by metric type',
      },
    },
    controller.aggregateUsage.bind(controller),
  );

  fastify.post(
    '/cloud/dr/schedule',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Schedule DR backup for workspace',
      },
    },
    controller.scheduleDr.bind(controller),
  );

  fastify.get(
    '/cloud/dr/schedules',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'List DR backup schedules',
      },
    },
    controller.listDrSchedules.bind(controller),
  );

  fastify.post(
    '/cloud/dr/schedules/:scheduleId/run',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Run scheduled DR backup',
      },
    },
    controller.runDrBackup.bind(controller),
  );

  fastify.post(
    '/cloud/dr/verify',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Verify DR integrity via sample backup read',
      },
    },
    controller.verifyDr.bind(controller),
  );

  fastify.post(
    '/cloud/dr/failover',
    {
      schema: {
        tags: ['Cloud Platform'],
        summary: 'Promote secondary region (failover)',
      },
    },
    controller.failover.bind(controller),
  );
}
