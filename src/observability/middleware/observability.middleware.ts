import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../../config/env.js';
import type { ILogShipper } from '../ports/ilog-shipper.port.js';
import type { IMetricsExporter } from '../ports/imetrics-exporter.port.js';
import type { ITraceExporter } from '../ports/itrace-exporter.port.js';
import { ObservabilityMetricNames } from '../catalog/metric-catalog.js';

export interface ObservabilityMiddlewareDeps {
  env: Env;
  metricsExporter: IMetricsExporter;
  traceExporter: ITraceExporter;
  logShipper: ILogShipper;
}

function resolveTransport(url: string): string {
  if (url.startsWith('/mcp')) return 'mcp';
  if (url.includes('/grpc')) return 'grpc';
  if (url.startsWith('/api/v1/ws')) return 'websocket';
  if (url.includes('/context/stream')) return 'sse';
  return 'rest';
}

function sanitizeRoute(url: string): string {
  const path = url.split('?')[0] ?? url;
  return path.replace(/\/[0-9a-f-]{36}/gi, '/:id').replace(/\/[0-9]+/g, '/:id');
}

/** REST middleware instrumentation — metrics/traces/logs at boundary (ADR-034). */
export function registerObservabilityMiddleware(
  fastify: FastifyInstance,
  deps: ObservabilityMiddlewareDeps,
): void {
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const route = sanitizeRoute(request.url);
    request.observabilitySpan = deps.traceExporter.startSpan(`${request.method} ${route}`, {
      'http.method': request.method,
      'http.route': route,
      'http.request_id': request.id,
    });
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const route = sanitizeRoute(request.url);
    const transport = resolveTransport(request.url);
    const status = String(reply.statusCode);
    const labels = { method: request.method, route, status, transport };

    deps.metricsExporter.incrementCounter({
      name: ObservabilityMetricNames.HTTP_REQUESTS_TOTAL,
      labels,
    });

    const durationSeconds = (reply.elapsedTime ?? 0) / 1000;
    deps.metricsExporter.observeHistogram({
      name: ObservabilityMetricNames.HTTP_REQUEST_DURATION,
      labels: { method: request.method, route, transport },
      valueSeconds: durationSeconds,
    });

    deps.metricsExporter.observeHistogram({
      name: ObservabilityMetricNames.PROTOCOL_REQUEST_DURATION,
      labels: { transport, route },
      valueSeconds: durationSeconds,
    });

    deps.traceExporter.endSpan(
      request.observabilitySpan ?? {},
      reply.statusCode,
      reply.statusCode >= 500,
    );

    void deps.logShipper.ship({
      level: reply.statusCode >= 500 ? 'error' : 'info',
      message: 'request completed',
      timestamp: new Date().toISOString(),
      service: deps.env.OTEL_SERVICE_NAME,
      traceId: request.observabilitySpan?.traceId,
      spanId: request.observabilitySpan?.spanId,
      fields: {
        reqId: request.id,
        method: request.method,
        url: route,
        statusCode: reply.statusCode,
        responseTimeMs: reply.elapsedTime,
        transport,
      },
    });
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    observabilitySpan?: import('../ports/itrace-exporter.port.js').TraceSpanContext;
  }
}
