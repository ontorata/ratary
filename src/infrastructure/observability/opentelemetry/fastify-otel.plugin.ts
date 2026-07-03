import type { FastifyInstance } from 'fastify';
import { context, SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('ai-memory-cloud');

/**
 * Fastify plugin — creates one HTTP span per request when OTEL is enabled.
 */
export async function openTelemetryFastifyPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', async (request) => {
    const span = tracer.startSpan(`${request.method} ${request.routeOptions.url ?? request.url}`, {
      attributes: {
        'http.method': request.method,
        'http.url': request.url,
        'http.request_id': request.id,
      },
    });
    request.openTelemetrySpan = span;
    request.openTelemetryContext = trace.setSpan(context.active(), span);
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const span = request.openTelemetrySpan;
    if (!span) {
      return;
    }

    span.setAttribute('http.status_code', reply.statusCode);
    if (reply.statusCode >= 500) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }
    span.end();
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    openTelemetrySpan?: import('@opentelemetry/api').Span;
    openTelemetryContext?: import('@opentelemetry/api').Context;
  }
}
