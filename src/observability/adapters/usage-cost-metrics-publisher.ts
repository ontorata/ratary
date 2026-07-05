import type { Env } from '../../config/env.js';
import type { IUsageMeter } from '../../cloud/ports/iusage-meter.port.js';
import type { UsageAggregate } from '../../cloud/types/usage.types.js';
import type { IMetricsExporter } from '../ports/imetrics-exporter.port.js';
import { ObservabilityMetricNames } from '../catalog/metric-catalog.js';

const DEFAULT_COST_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface UsageCostGaugeValues {
  embeddingEstimateUsd: number;
  storageBytes: number;
}

export function computeUsageCostGaugeValues(
  aggregates: UsageAggregate[],
  env: Pick<Env, 'COST_EMBEDDING_USD_PER_REQUEST' | 'COST_ESTIMATED_BYTES_PER_MEMORY'>,
): UsageCostGaugeValues {
  let embeddingRequests = 0;
  let storageEvents = 0;

  for (const aggregate of aggregates) {
    if (aggregate.metricType === 'embedding.request') {
      embeddingRequests += aggregate.totalQuantity;
    }
    if (aggregate.metricType === 'memory.created' || aggregate.metricType === 'memory.updated') {
      storageEvents += aggregate.totalQuantity;
    }
  }

  return {
    embeddingEstimateUsd: embeddingRequests * env.COST_EMBEDDING_USD_PER_REQUEST,
    storageBytes: storageEvents * env.COST_ESTIMATED_BYTES_PER_MEMORY,
  };
}

export async function publishUsageCostMetrics(
  usageMeter: IUsageMeter,
  metricsExporter: IMetricsExporter,
  env: Pick<
    Env,
    'COST_EMBEDDING_USD_PER_REQUEST' | 'COST_ESTIMATED_BYTES_PER_MEMORY'
  >,
  now = new Date(),
): Promise<UsageCostGaugeValues> {
  const periodEnd = now.toISOString();
  const periodStart = new Date(now.getTime() - DEFAULT_COST_WINDOW_MS).toISOString();
  const aggregates = await usageMeter.aggregate({ periodStart, periodEnd });
  const values = computeUsageCostGaugeValues(aggregates, env);

  metricsExporter.setGauge({
    name: ObservabilityMetricNames.COST_EMBEDDING_USD,
    labels: {},
    value: values.embeddingEstimateUsd,
  });
  metricsExporter.setGauge({
    name: ObservabilityMetricNames.COST_STORAGE_BYTES,
    labels: {},
    value: values.storageBytes,
  });

  return values;
}
