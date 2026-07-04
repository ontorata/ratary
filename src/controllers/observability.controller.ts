import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import type { ObservabilityPorts } from '../composition/create-observability-ports.js';
import { ForbiddenError } from '../types/errors.js';

export function createObservabilityController(env: Env, ports: ObservabilityPorts) {
  function assertEnabled(): void {
    if (!ports.enabled) {
      throw new ForbiddenError('Observability platform is disabled (OBSERVABILITY_PLATFORM=false)');
    }
  }

  return {
    async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.send({
        enabled: ports.enabled,
        metricsPath: env.OBS_METRICS_PATH,
        logShipper: env.OBS_LOG_SHIPPER,
        otelEnabled: env.OTEL_ENABLED,
        registeredMetrics: ports.metricsExporter.listRegisteredMetrics().length,
        traceEnabled: ports.traceExporter.isEnabled(),
      });
    },

    async listDashboards(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const packs = await ports.dashboardPack.listPacks();
      reply.send({ packs, count: packs.length });
    },

    async getDashboard(
      request: FastifyRequest<{ Params: { packId: string } }>,
      reply: FastifyReply,
    ): Promise<void> {
      assertEnabled();
      const pack = await ports.dashboardPack.getPack(request.params.packId);
      if (!pack) {
        reply.status(404).send({ error: 'Dashboard pack not found' });
        return;
      }
      reply.send(pack);
    },

    async listSlos(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const slos = await ports.sloRegistry.listSlos();
      reply.send({ slos, count: slos.length });
    },

    async listAlerts(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const alerts = await ports.sloRegistry.listAlertTemplates();
      reply.send({ alerts, count: alerts.length });
    },

    async exportAlertmanager(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
      assertEnabled();
      const yaml = await ports.sloRegistry.exportAlertmanagerYaml();
      reply.header('Content-Type', 'text/yaml');
      reply.send(yaml);
    },
  };
}

export type ObservabilityController = ReturnType<typeof createObservabilityController>;
