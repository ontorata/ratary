import type { TransportSource } from '../shared/transport-context.types.js';

export type ProtocolKind = TransportSource;

export interface ProtocolBenchmarkResult {
  protocol: ProtocolKind;
  mode: 'unary' | 'stream';
  p50Ms: number;
  p95Ms: number;
  throughputRps?: number;
  bytesTransferred?: number;
}

export interface ProtocolBenchmarkReport {
  fixture: string;
  iterations: number;
  results: ProtocolBenchmarkResult[];
  timestamp: string;
}

export interface ProtocolBenchmarkConfig {
  fixture: string;
  iterations: number;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index] ?? 0;
}

export interface BenchmarkSample {
  protocol: ProtocolKind;
  mode: 'unary' | 'stream';
  durationMs: number;
}

/** Aggregates raw samples into a protocol benchmark report (ADR-028 Phase 13E). */
export function buildProtocolBenchmarkReport(
  config: ProtocolBenchmarkConfig,
  samples: BenchmarkSample[],
): ProtocolBenchmarkReport {
  const grouped = new Map<string, number[]>();
  for (const sample of samples) {
    const key = `${sample.protocol}:${sample.mode}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(sample.durationMs);
    grouped.set(key, bucket);
  }

  const results: ProtocolBenchmarkResult[] = [];
  for (const [key, durations] of grouped) {
    const [protocol, mode] = key.split(':') as [ProtocolKind, 'unary' | 'stream'];
    results.push({
      protocol,
      mode,
      p50Ms: percentile(durations, 50),
      p95Ms: percentile(durations, 95),
      throughputRps: durations.length > 0 ? 1000 / percentile(durations, 50) : undefined,
    });
  }

  return {
    fixture: config.fixture,
    iterations: config.iterations,
    results,
    timestamp: new Date().toISOString(),
  };
}
