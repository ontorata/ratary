import type { TelemetryEnvelope, TelemetryEvent, TelemetryScopeRef } from '../types/telemetry-event.js';

/** Fire-and-forget semantic telemetry recorder (Phase 25 / ADR-037). */
export interface ITelemetryRecorder {
  record(event: TelemetryEvent, scope: TelemetryScopeRef): void;
  flush(): Promise<void>;
}

/** Backend telemetry exporter (OTLP/Prometheus/noop). */
export interface ITelemetrySink {
  readonly kind: 'otlp' | 'prometheus' | 'noop';
  emit(batch: readonly TelemetryEnvelope[]): Promise<void>;
}

/** Privacy redaction before egress (Phase 25). */
export interface ITelemetryRedactor {
  redact(envelope: TelemetryEnvelope): TelemetryEnvelope;
}
