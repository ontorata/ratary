import type { Env } from '../config/env.js';
import type { FastifyInstance } from 'fastify';
import type { IUsageMeter } from '../cloud/ports/iusage-meter.port.js';
import { NoOpUsageMeter } from '../cloud/adapters/noop-usage-meter.js';
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
  publishUsageCostMetrics,
  type IMetricsExporter,
  type ITraceExporter,
  type ILogShipper,
  type IDashboardPack,
  type ISloRegistry,
} from '../observability/index.js';

export interface UsageCostMetricsDeps {
  usageMeter: IUsageMeter;
  usageMeterEnabled: boolean;
}

export interface ObservabilityPorts {
  enabled: boolean;
  metricsExporter: IMetricsExporter;
  traceExporter: ITraceExporter;
  logShipper: ILogShipper;
  dashboardPack: IDashboardPack;
  sloRegistry: ISloRegistry;
  registerMiddleware(fastify: FastifyInstance): void;
  registerMetricsRoute(fastify: FastifyInstance, costMetrics?: UsageCostMetricsDeps): void;
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
    registerMetricsRoute(_fastify: FastifyInstance, _costMetrics?: UsageCostMetricsDeps) {
      return undefined;
    },
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
    registerMetricsRoute(fastify: FastifyInstance, costMetrics?: UsageCostMetricsDeps) {
      fastify.get(env.OBS_METRICS_PATH, async (_request, reply) => {
        if (
          env.OBS_COST_METRICS_ENABLED &&
          costMetrics?.usageMeterEnabled &&
          costMetrics.usageMeter &&
          !(costMetrics.usageMeter instanceof NoOpUsageMeter)
        ) {
          await publishUsageCostMetrics(costMetrics.usageMeter, metricsExporter, env);
        }
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
