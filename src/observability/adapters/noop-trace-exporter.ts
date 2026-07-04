import type { ITraceExporter, TraceSpanContext } from '../ports/itrace-exporter.port.js';

/** No-op trace exporter — default when platform disabled or OTEL off. */
export class NoOpTraceExporter implements ITraceExporter {
  isEnabled(): boolean {
    return false;
  }

  startSpan(_name: string, _attributes?: Record<string, string | number | boolean>): TraceSpanContext {
    return {};
  }

  endSpan(_context: TraceSpanContext, _statusCode?: number, _error?: boolean): void {
    // intentionally empty
  }

  injectTraceHeaders(headers: Record<string, string>): Record<string, string> {
    return headers;
  }
}
