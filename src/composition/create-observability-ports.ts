import type { Env } from '../config/env.js';
import type { FastifyInstance } from 'fastify';
import {
  NoOpMetricsExporter,
  PrometheusMetricsExporter,
  NoOpTraceExporter,
  OtelTraceExporter,
  NoOpLogShipper,
  StdoutLogShipper,
  LokiLogShipper,
  FileDashboardPack,
  NoOpDashboardPack,
  FileSloRegistry,
  NoOpSloRegistry,
  registerObservabilityMetricCatalog,
  registerObservabilityMiddleware,
  type IMetricsExporter,
  type ITraceExporter,
  type ILogShipper,
  type IDashboardPack,
  type ISloRegistry,
} from '../observability/index.js';

export interface ObservabilityPorts {
  enabled: boolean;
  metricsExporter: IMetricsExporter;
  traceExporter: ITraceExporter;
  logShipper: ILogShipper;
  dashboardPack: IDashboardPack;
  sloRegistry: ISloRegistry;
  registerMiddleware(fastify: FastifyInstance): void;
  registerMetricsRoute(fastify: FastifyInstance): void;
}

/**
 * Composition root for Phase 19 observability platform (ADR-034).
 * Gated by OBSERVABILITY_PLATFORM — default off preserves pre-Phase-19 behavior.
 */
export function createObservabilityPorts(env: Env): ObservabilityPorts {
  const noop: ObservabilityPorts = {
    enabled: false,
    metricsExporter: new NoOpMetricsExporter(),
    traceExporter: new NoOpTraceExporter(),
    logShipper: new NoOpLogShipper(),
    dashboardPack: new NoOpDashboardPack(),
    sloRegistry: new NoOpSloRegistry(),
    registerMiddleware: () => undefined,
    registerMetricsRoute: () => undefined,
  };

  if (!env.OBSERVABILITY_PLATFORM) {
    return noop;
  }

  const metricsExporter = new PrometheusMetricsExporter();
  registerObservabilityMetricCatalog(metricsExporter);

  const traceExporter = new OtelTraceExporter(env);
  const logShipper = createLogShipper(env);
  const dashboardPack = new FileDashboardPack();
  const sloRegistry = new FileSloRegistry();

  return {
    enabled: true,
    metricsExporter,
    traceExporter,
    logShipper,
    dashboardPack,
    sloRegistry,
    registerMiddleware(fastify: FastifyInstance) {
      registerObservabilityMiddleware(fastify, {
        env,
        metricsExporter,
        traceExporter,
        logShipper,
      });
    },
    registerMetricsRoute(fastify: FastifyInstance) {
      fastify.get(env.OBS_METRICS_PATH, async (_request, reply) => {
        reply.header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        reply.send(metricsExporter.exportPrometheusText());
      });
    },
  };
}

function createLogShipper(env: Env): ILogShipper {
  if (env.OBS_LOG_SHIPPER === 'loki' && env.OBS_LOKI_PUSH_URL) {
    return new LokiLogShipper({
      pushUrl: env.OBS_LOKI_PUSH_URL,
      serviceName: env.OTEL_SERVICE_NAME,
    });
  }
  if (env.OBS_LOG_SHIPPER === 'stdout') {
    return new StdoutLogShipper();
  }
  return new NoOpLogShipper();
}
