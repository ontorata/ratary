import type {
  CounterIncrement,
  GaugeSet,
  HistogramObservation,
  MetricDescriptor,
} from '../types/metrics.types.js';
import type { IMetricsExporter } from '../ports/imetrics-exporter.port.js';

function labelKey(labels: Record<string, string>): string {
  const keys = Object.keys(labels).sort();
  return keys.map((k) => `${k}=${labels[k]}`).join(',');
}

function escapeLabelValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function formatLabels(labels: Record<string, string>): string {
  const keys = Object.keys(labels).sort();
  if (keys.length === 0) return '';
  const body = keys.map((k) => `${k}="${escapeLabelValue(labels[k] ?? '')}"`).join(',');
  return `{${body}}`;
}

/** No-op metrics exporter when OBSERVABILITY_PLATFORM=false. */
export class NoOpMetricsExporter implements IMetricsExporter {
  registerMetric(_descriptor: MetricDescriptor): void {
    // intentionally empty
  }

  incrementCounter(_input: CounterIncrement): void {
    // intentionally empty
  }

  setGauge(_input: GaugeSet): void {
    // intentionally empty
  }

  observeHistogram(_input: HistogramObservation): void {
    // intentionally empty
  }

  exportPrometheusText(): string {
    return '';
  }

  listRegisteredMetrics(): readonly MetricDescriptor[] {
    return [];
  }
}

interface HistogramState {
  sum: number;
  count: number;
  buckets: Map<number, number>;
}

const DEFAULT_HISTOGRAM_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

/** In-memory Prometheus text exporter (Phase 19). */
export class PrometheusMetricsExporter implements IMetricsExporter {
  private readonly descriptors = new Map<string, MetricDescriptor>();
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  private readonly histograms = new Map<string, HistogramState>();

  registerMetric(descriptor: MetricDescriptor): void {
    this.descriptors.set(descriptor.name, descriptor);
  }

  incrementCounter(input: CounterIncrement): void {
    const key = `${input.name}|${labelKey(input.labels)}`;
    const current = this.counters.get(key) ?? 0;
    this.counters.set(key, current + (input.delta ?? 1));
    if (!this.descriptors.has(input.name)) {
      this.registerMetric({ name: input.name, type: 'counter', help: input.name });
    }
  }

  setGauge(input: GaugeSet): void {
    const key = `${input.name}|${labelKey(input.labels)}`;
    this.gauges.set(key, input.value);
    if (!this.descriptors.has(input.name)) {
      this.registerMetric({ name: input.name, type: 'gauge', help: input.name });
    }
  }

  observeHistogram(input: HistogramObservation): void {
    const key = `${input.name}|${labelKey(input.labels)}`;
    let state = this.histograms.get(key);
    if (!state) {
      state = { sum: 0, count: 0, buckets: new Map(DEFAULT_HISTOGRAM_BUCKETS.map((b) => [b, 0])) };
      this.histograms.set(key, state);
    }
    state.sum += input.valueSeconds;
    state.count += 1;
    for (const [le, count] of state.buckets) {
      if (input.valueSeconds <= le) {
        state.buckets.set(le, count + 1);
      }
    }
    if (!this.descriptors.has(input.name)) {
      this.registerMetric({ name: input.name, type: 'histogram', help: input.name });
    }
  }

  exportPrometheusText(): string {
    const lines: string[] = [];

    for (const descriptor of this.descriptors.values()) {
      lines.push(`# HELP ${descriptor.name} ${descriptor.help}`);
      lines.push(`# TYPE ${descriptor.name} ${descriptor.type}`);
    }

    for (const [key, value] of this.counters) {
      const [name, labelPart] = key.split('|');
      const labels = parseLabelPart(labelPart);
      lines.push(`${name}${formatLabels(labels)} ${value}`);
    }

    for (const [key, value] of this.gauges) {
      const [name, labelPart] = key.split('|');
      const labels = parseLabelPart(labelPart);
      lines.push(`${name}${formatLabels(labels)} ${value}`);
    }

    for (const [key, state] of this.histograms) {
      const [name, labelPart] = key.split('|');
      const labels = parseLabelPart(labelPart);
      let cumulative = 0;
      for (const [le, count] of [...state.buckets.entries()].sort((a, b) => a[0] - b[0])) {
        cumulative += count;
        lines.push(`${name}_bucket${formatLabels({ ...labels, le: String(le) })} ${cumulative}`);
      }
      lines.push(`${name}_sum${formatLabels(labels)} ${state.sum}`);
      lines.push(`${name}_count${formatLabels(labels)} ${state.count}`);
    }

    return `${lines.join('\n')}\n`;
  }

  listRegisteredMetrics(): readonly MetricDescriptor[] {
    return [...this.descriptors.values()];
  }
}

function parseLabelPart(labelPart: string | undefined): Record<string, string> {
  if (!labelPart) return {};
  const labels: Record<string, string> = {};
  for (const segment of labelPart.split(',')) {
    const eq = segment.indexOf('=');
    if (eq === -1) continue;
    labels[segment.slice(0, eq)] = segment.slice(eq + 1);
  }
  return labels;
}
