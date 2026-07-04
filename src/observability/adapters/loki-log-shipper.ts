import type { LogEntry } from '../types/log.types.js';
import type { ILogShipper } from '../ports/ilog-shipper.port.js';

export interface LokiLogShipperOptions {
  pushUrl: string;
  serviceName: string;
}

/** Async Loki push adapter — fire-and-forget (ADR-034). */
export class LokiLogShipper implements ILogShipper {
  private readonly buffer: LogEntry[] = [];

  constructor(private readonly options: LokiLogShipperOptions) {}

  async ship(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);
    if (this.buffer.length >= 10) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    const values = batch.map((entry) => [
      String(Date.parse(entry.timestamp) * 1_000_000),
      JSON.stringify({
        level: entry.level,
        message: entry.message,
        service: entry.service,
        traceId: entry.traceId,
        spanId: entry.spanId,
        ...entry.fields,
      }),
    ]);

    const payload = {
      streams: [
        {
          stream: {
            service: this.options.serviceName,
            level: batch[0]?.level ?? 'info',
          },
          values,
        },
      ],
    };

    try {
      await fetch(this.options.pushUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fire-and-forget — logging must not fail requests
    }
  }
}
