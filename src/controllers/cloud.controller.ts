import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { CloudPorts } from '../composition/create-cloud-ports.js';
import { ForbiddenError, ValidationError } from '../types/errors.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';

export function createCloudController(env: Env, ports: CloudPorts, scopeResolver: IScopeResolver) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError('Cloud platform is disabled (CONTROL_PLANE_ENABLED=false)');
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        usageMeterEnabled: ports.usageMeterEnabled,
        drEnabled: ports.drEnabled,
        defaultRegion: env.CLOUD_DEFAULT_REGION,
        cloudProvisioner: env.CLOUD_PROVISIONER,
      });
    },

    async listRegions(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const regions = await ports.controlPlane.listRegions();
      reply.send({ regions, count: regions.length });
    },

    async provisionWorkspace(
      request: FastifyRequest<{
        Body: {
          organizationId: string;
          workspaceId: string;
          ownerId?: string;
          departmentId?: string;
          tenantProjectId?: string;
          primaryRegionId?: string;
          secondaryRegionId?: string;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const body = request.body;
      const ownerId = body.ownerId?.trim() || request.user?.ownerId;
      if (!ownerId) throw new ValidationError('ownerId is required');

      const record = await ports.controlPlane.provisionWorkspace({
        organizationId: body.organizationId,
        workspaceId: body.workspaceId,
        ownerId,
        departmentId: body.departmentId,
        tenantProjectId: body.tenantProjectId,
        primaryRegionId: body.primaryRegionId,
        secondaryRegionId: body.secondaryRegionId,
      });
      reply.status(201).send(record);
    },

    async deprovisionWorkspace(
      request: FastifyRequest<{
        Body: { organizationId: string; workspaceId: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const { organizationId, workspaceId } = request.body;
      const record = await ports.controlPlane.deprovisionWorkspace(organizationId, workspaceId);
      reply.send(record);
    },

    async assignRegion(
      request: FastifyRequest<{
        Params: { workspaceId: string };
        Body: {
          organizationId: string;
          primaryRegionId: string;
          secondaryRegionId?: string;
          readPreference?: 'primary' | 'secondary' | 'nearest';
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const { workspaceId } = request.params;
      const { organizationId, primaryRegionId, secondaryRegionId, readPreference } = request.body;
      if (!organizationId) throw new ValidationError('organizationId is required');

      const assignment = await ports.controlPlane.assignRegion(organizationId, workspaceId, {
        primaryRegionId,
        secondaryRegionId,
        readPreference,
      });
      reply.send(assignment);
    },

    async getTopology(
      request: FastifyRequest<{
        Params: { workspaceId: string };
        Querystring: { organizationId?: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const organizationId = request.query.organizationId?.trim();
      if (!organizationId) throw new ValidationError('organizationId query parameter is required');

      const topology = await ports.controlPlane.getTenantTopology(
        organizationId,
        request.params.workspaceId,
      );
      reply.send(topology);
    },

    async rotateApiKey(
      request: FastifyRequest<{ Params: { identityId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const ownerId = request.user?.ownerId;
      if (!ownerId) throw new ValidationError('Authentication required');

      const result = await ports.controlPlane.rotateApiKey(request.params.identityId, ownerId);
      reply.send(result);
    },

    async exportUsage(
      request: FastifyRequest<{
        Querystring: {
          organizationId?: string;
          ownerId?: string;
          workspaceId?: string;
          periodStart?: string;
          periodEnd?: string;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      if (!ports.usageMeterEnabled) {
        throw new ForbiddenError('Usage meter is disabled (USAGE_METER_ENABLED=false)');
      }
      const result = await ports.usageMeter.export({
        organizationId: request.query.organizationId,
        ownerId: request.query.ownerId ?? request.user?.ownerId,
        workspaceId: request.query.workspaceId,
        periodStart: request.query.periodStart,
        periodEnd: request.query.periodEnd,
        format: 'json',
      });
      reply.send(result);
    },

    async aggregateUsage(
      request: FastifyRequest<{
        Querystring: {
          organizationId?: string;
          ownerId?: string;
          workspaceId?: string;
          periodStart?: string;
          periodEnd?: string;
        };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      if (!ports.usageMeterEnabled) {
        throw new ForbiddenError('Usage meter is disabled (USAGE_METER_ENABLED=false)');
      }
      const aggregates = await ports.usageMeter.aggregate({
        organizationId: request.query.organizationId,
        ownerId: request.query.ownerId ?? request.user?.ownerId,
        workspaceId: request.query.workspaceId,
        periodStart: request.query.periodStart,
        periodEnd: request.query.periodEnd,
      });
      reply.send({ aggregates, count: aggregates.length });
    },

    async scheduleDr(
      request: FastifyRequest<{
        Body: { workspaceId: string; cronExpression?: string };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      if (!ports.drEnabled) {
        throw new ForbiddenError('DR platform is disabled (DR_PLATFORM_ENABLED=false)');
      }
      const ownerId = request.user?.ownerId;
      if (!ownerId) throw new ValidationError('Authentication required');

      const schedule = await ports.disasterRecovery.scheduleBackup({
        workspaceId: request.body.workspaceId,
        ownerId,
        cronExpression: request.body.cronExpression,
      });
      reply.status(201).send(schedule);
    },

    async runDrBackup(
      request: FastifyRequest<{ Params: { scheduleId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      if (!ports.drEnabled) {
        throw new ForbiddenError('DR platform is disabled (DR_PLATFORM_ENABLED=false)');
      }
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const snapshot = await ports.disasterRecovery.runScheduledBackup(
        request.params.scheduleId,
        scope,
      );
      reply.send(snapshot);
    },

    async verifyDr(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      if (!ports.drEnabled) {
        throw new ForbiddenError('DR platform is disabled (DR_PLATFORM_ENABLED=false)');
      }
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const report = await ports.disasterRecovery.verifyIntegrity(scope);
      reply.send(report);
    },

    async failover(
      request: FastifyRequest<{
        Body: { workspaceId: string; promoteSecondary?: boolean };
      }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      if (!ports.drEnabled) {
        throw new ForbiddenError('DR platform is disabled (DR_PLATFORM_ENABLED=false)');
      }
      const ownerId = request.user?.ownerId;
      if (!ownerId) throw new ValidationError('Authentication required');

      const result = await ports.disasterRecovery.failover({
        workspaceId: request.body.workspaceId,
        ownerId,
        promoteSecondary: request.body.promoteSecondary ?? true,
      });
      reply.send(result);
    },

    async listDrSchedules(
      request: FastifyRequest<{ Querystring: { workspaceId?: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      if (!ports.drEnabled) {
        throw new ForbiddenError('DR platform is disabled (DR_PLATFORM_ENABLED=false)');
      }
      const ownerId = request.user?.ownerId;
      if (!ownerId) throw new ValidationError('Authentication required');

      const schedules = await ports.disasterRecovery.listSchedules(
        ownerId,
        request.query.workspaceId,
      );
      reply.send({ schedules, count: schedules.length });
    },
  };
}

export type CloudController = ReturnType<typeof createCloudController>;
