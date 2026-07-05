import type { ITelemetryRedactor, ITelemetrySink } from '../ports/itelemetry.port.js';
import type { TelemetryEnvelope } from '../types/telemetry-event.js';

export class DefaultTelemetryRedactor implements ITelemetryRedactor {
  redact(envelope: TelemetryEnvelope): TelemetryEnvelope {
    const attrs = { ...envelope.attributes };
    for (const key of Object.keys(attrs)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('body') ||
        lower.includes('content') ||
        lower.includes('prompt') ||
        lower.includes('text')
      ) {
        attrs[key] = '[redacted]';
      }
    }
    return {
      ...envelope,
      attributes: attrs,
      redaction: 'hashed',
    };
  }
}

export class NoOpTelemetrySink implements ITelemetrySink {
  readonly kind = 'noop' as const;

  async emit(): Promise<void> {
    return undefined;
  }
}

export class PrometheusTelemetrySink implements ITelemetrySink {
  readonly kind = 'prometheus' as const;

  constructor(private readonly record: (name: string, labels: Record<string, string>) => void) {}

  async emit(batch: readonly TelemetryEnvelope[]): Promise<void> {
    for (const envelope of batch) {
      this.record('global_intelligence_telemetry_events_total', {
        type: envelope.type,
        node_id: envelope.nodeId,
      });
    }
  }
}
