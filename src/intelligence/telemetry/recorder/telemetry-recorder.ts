import { randomUUID } from 'node:crypto';
import type {
  ITelemetryRecorder,
  ITelemetryRedactor,
  ITelemetrySink,
} from '../ports/itelemetry.port.js';
import type {
  TelemetryEnvelope,
  TelemetryEvent,
  TelemetryScopeRef,
} from '../types/telemetry-event.js';
import type { IIntelligenceStore } from '../../sync/ports/iglobal-sync.port.js';

export class TelemetryRecorder implements ITelemetryRecorder {
  private readonly buffer: TelemetryEnvelope[] = [];
  private readonly maxBuffer = 64;

  constructor(
    private readonly nodeId: string,
    private readonly redactor: ITelemetryRedactor,
    private readonly sinks: readonly ITelemetrySink[],
    private readonly store: IIntelligenceStore | null,
    private readonly enabled: boolean,
  ) {}

  record(event: TelemetryEvent, scope: TelemetryScopeRef): void {
    if (!this.enabled) return;

    const envelope = this.redactor.redact({
      eventId: randomUUID(),
      type: event.type,
      occurredAt: new Date().toISOString(),
      scope,
      nodeId: this.nodeId,
      attributes: this.toAttributes(event),
      redaction: 'none',
      payload: event,
    });

    this.buffer.push(envelope);
    if (this.buffer.length >= this.maxBuffer) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);

    if (this.store) {
      for (const envelope of batch) {
        await this.store.persistTelemetry(envelope);
      }
    }

    for (const sink of this.sinks) {
      await sink.emit(batch);
    }
  }

  private toAttributes(event: TelemetryEvent): Record<string, string | number | boolean> {
    const attrs: Record<string, string | number | boolean> = { type: event.type };
    for (const [key, value] of Object.entries(event)) {
      if (key === 'type' || value === undefined) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        attrs[key] = value;
      } else if (Array.isArray(value)) {
        attrs[key] = value.join(',');
      }
    }
    return attrs;
  }
}

export class NoOpTelemetryRecorder implements ITelemetryRecorder {
  record(): void {
    return undefined;
  }

  async flush(): Promise<void> {
    return undefined;
  }
}
