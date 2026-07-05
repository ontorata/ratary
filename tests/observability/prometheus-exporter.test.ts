import { describe, it, expect } from 'vitest';
import { PrometheusMetricsExporter } from '../../src/observability/adapters/prometheus-metrics-exporter.js';
import { registerObservabilityMetricCatalog } from '../../src/observability/catalog/metric-catalog.js';

describe('PrometheusMetricsExporter', () => {
  it('exports counter and histogram samples in Prometheus text format', () => {
    const exporter = new PrometheusMetricsExporter();
    registerObservabilityMetricCatalog(exporter);

    exporter.incrementCounter({
      name: 'ratary_http_requests_total',
      labels: { method: 'GET', route: '/api/v1/health', status: '200', transport: 'rest' },
    });

    exporter.observeHistogram({
      name: 'ratary_http_request_duration_seconds',
      labels: { method: 'GET', route: '/api/v1/health', transport: 'rest' },
      valueSeconds: 0.042,
    });

    const text = exporter.exportPrometheusText();
    expect(text).toContain('# HELP ratary_http_requests_total');
    expect(text).toContain('ratary_http_requests_total{');
    expect(text).toContain('ratary_http_request_duration_seconds_bucket');
    expect(text).toContain('ratary_http_request_duration_seconds_count');
  });
});
