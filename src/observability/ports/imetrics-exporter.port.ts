import type {
  CounterIncrement,
  GaugeSet,
  HistogramObservation,
  MetricDescriptor,
} from '../types/metrics.types.js';

/** Prometheus-format metrics export (ADR-034). */
export interface IMetricsExporter {
  registerMetric(descriptor: MetricDescriptor): void;
  incrementCounter(input: CounterIncrement): void;
  setGauge(input: GaugeSet): void;
  observeHistogram(input: HistogramObservation): void;
  exportPrometheusText(): string;
  listRegisteredMetrics(): readonly MetricDescriptor[];
}
