export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface MetricLabels {
  readonly [key: string]: string;
}

export interface MetricDescriptor {
  name: string;
  type: MetricType;
  help: string;
}

export interface HistogramObservation {
  name: string;
  labels: MetricLabels;
  valueSeconds: number;
}

export interface CounterIncrement {
  name: string;
  labels: MetricLabels;
  delta?: number;
}

export interface GaugeSet {
  name: string;
  labels: MetricLabels;
  value: number;
}
