/** OpenTelemetry trace export bridge (ADR-034). */
export interface TraceSpanContext {
  traceId?: string;
  spanId?: string;
}

export interface ITraceExporter {
  isEnabled(): boolean;
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): TraceSpanContext;
  endSpan(context: TraceSpanContext, statusCode?: number, error?: boolean): void;
  injectTraceHeaders(headers: Record<string, string>): Record<string, string>;
}
