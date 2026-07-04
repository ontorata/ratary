import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Env } from '../../config/env.js';
import { isOpenTelemetryEnabled } from '../../infrastructure/observability/opentelemetry/otel-state.js';
import type { ITraceExporter, TraceSpanContext } from '../ports/itrace-exporter.port.js';

/** Bridges observability platform to existing OTel SDK (Phase 19 + C12). */
export class OtelTraceExporter implements ITraceExporter {
  private readonly tracer = trace.getTracer('ai-brain-observability');

  constructor(private readonly env: Env) {}

  isEnabled(): boolean {
    return isOpenTelemetryEnabled(this.env);
  }

  startSpan(
    name: string,
    attributes?: Record<string, string | number | boolean>,
  ): TraceSpanContext {
    if (!this.isEnabled()) return {};
    const span = this.tracer.startSpan(name, { attributes });
    const spanContext = span.spanContext();
    trace.setSpan(context.active(), span);
    return { traceId: spanContext.traceId, spanId: spanContext.spanId };
  }

  endSpan(spanCtx: TraceSpanContext, statusCode?: number, error?: boolean): void {
    if (!this.isEnabled() || !spanCtx.spanId) return;
    const span = trace.getActiveSpan();
    if (!span) return;
    if (statusCode !== undefined) {
      span.setAttribute('http.status_code', statusCode);
    }
    span.setStatus({
      code: error ? SpanStatusCode.ERROR : SpanStatusCode.OK,
    });
    span.end();
  }

  injectTraceHeaders(headers: Record<string, string>): Record<string, string> {
    if (!this.isEnabled()) return headers;
    const span = trace.getActiveSpan();
    if (!span) return headers;
    const { traceId, spanId } = span.spanContext();
    if (traceId && spanId) {
      headers.traceparent = `00-${traceId}-${spanId}-01`;
    }
    return headers;
  }
}
