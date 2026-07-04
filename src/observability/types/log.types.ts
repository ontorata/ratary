export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  service: string;
  traceId?: string;
  spanId?: string;
  labels?: Record<string, string>;
  fields?: Record<string, unknown>;
}
