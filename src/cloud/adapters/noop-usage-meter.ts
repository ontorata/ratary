import type { IUsageMeter } from '../ports/iusage-meter.port.js';
import type { UsageAggregate, UsageExportOptions, UsageMetricType, UsageRecord } from '../types/usage.types.js';

const METRIC_TYPES: UsageMetricType[] = [
  'memory.created',
  'memory.updated',
  'memory.deleted',
  'memory.accessed',
  'search.query',
  'embedding.request',
  'federation.egress',
];

/** No-op usage meter — default when USAGE_METER_ENABLED=false. */
export class NoOpUsageMeter implements IUsageMeter {
  async recordUsage(_record: Omit<UsageRecord, 'id'>): Promise<void> {
    // intentionally empty
  }

  async aggregate(): Promise<UsageAggregate[]> {
    return [];
  }

  async export(_options: UsageExportOptions): Promise<{ format: string; records: UsageRecord[] }> {
    return { format: 'json', records: [] };
  }

  supportedMetricTypes(): readonly UsageMetricType[] {
    return METRIC_TYPES;
  }
}
