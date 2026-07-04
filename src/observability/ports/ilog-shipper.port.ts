import type { LogEntry } from '../types/log.types.js';

/** Structured log shipping — Loki or stdout (ADR-034). */
export interface ILogShipper {
  ship(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
}
