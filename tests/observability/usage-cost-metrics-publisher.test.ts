import { describe, it, expect } from 'vitest';
import { InMemoryUsageMeter } from '../../src/cloud/adapters/in-memory-usage-meter.js';
import {
  computeUsageCostGaugeValues,
  publishUsageCostMetrics,
} from '../../src/observability/adapters/usage-cost-metrics-publisher.js';
import { PrometheusMetricsExporter } from '../../src/observability/adapters/prometheus-metrics-exporter.js';
import { ObservabilityMetricNames } from '../../src/observability/catalog/metric-catalog.js';

describe('usage-cost-metrics-publisher', () => {
  it('computes embedding USD and storage bytes from meter aggregates', () => {
    const values = computeUsageCostGaugeValues(
      [
        {
          ownerId: 'o1',
          metricType: 'embedding.request',
          totalQuantity: 10,
          periodStart: '',
          periodEnd: '',
        },
        {
          ownerId: 'o1',
          metricType: 'memory.created',
          totalQuantity: 3,
          periodStart: '',
          periodEnd: '',
        },
      ],
      {
        COST_EMBEDDING_USD_PER_REQUEST: 0.00002,
        COST_ESTIMATED_BYTES_PER_MEMORY: 4096,
      },
    );

    expect(values.embeddingEstimateUsd).toBeCloseTo(0.0002);
    expect(values.storageBytes).toBe(12288);
  });

  it('publishes gauges on metrics exporter', async () => {
    const meter = new InMemoryUsageMeter();
    const now = new Date().toISOString();
    await meter.recordUsage({
      ownerId: 'owner-1',
      metricType: 'embedding.request',
      quantity: 5,
      occurredAt: now,
    });

    const exporter = new PrometheusMetricsExporter();
    exporter.registerMetric({
      name: ObservabilityMetricNames.COST_EMBEDDING_USD,
      type: 'gauge',
      help: 'test',
    });
    exporter.registerMetric({
      name: ObservabilityMetricNames.COST_STORAGE_BYTES,
      type: 'gauge',
      help: 'test',
    });

    const values = await publishUsageCostMetrics(meter, exporter, {
      COST_EMBEDDING_USD_PER_REQUEST: 0.00002,
      COST_ESTIMATED_BYTES_PER_MEMORY: 4096,
    });

    expect(values.embeddingEstimateUsd).toBeCloseTo(0.0001);
    const text = exporter.exportPrometheusText();
    expect(text).toContain('ratary_cost_embedding_estimate_usd');
    expect(text).toContain('ratary_cost_storage_bytes');
  });
});
