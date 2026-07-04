import { randomUUID } from 'node:crypto';
import type { IUsageMeter } from '../ports/iusage-meter.port.js';
import type {
  UsageAggregate,
  UsageExportOptions,
  UsageMetricType,
  UsageRecord,
} from '../types/usage.types.js';

const METRIC_TYPES: UsageMetricType[] = [
  'memory.created',
  'memory.updated',
  'memory.deleted',
  'memory.accessed',
  'search.query',
  'embedding.request',
  'federation.egress',
];

/** In-process usage meter for tests and memory store provider. */
export class InMemoryUsageMeter implements IUsageMeter {
  private readonly records: UsageRecord[] = [];

  async recordUsage(record: Omit<UsageRecord, 'id'>): Promise<void> {
    this.records.push({ ...record, id: randomUUID() });
  }

  async aggregate(options: {
    ownerId?: string;
    workspaceId?: string;
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<UsageAggregate[]> {
    const filtered = this.filterRecords(options);
    const buckets = new Map<string, UsageAggregate>();

    for (const record of filtered) {
      const key = `${record.ownerId}|${record.workspaceId ?? ''}|${record.organizationId ?? ''}|${record.metricType}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.totalQuantity += record.quantity;
        continue;
      }
      buckets.set(key, {
        ownerId: record.ownerId,
        workspaceId: record.workspaceId,
        organizationId: record.organizationId,
        metricType: record.metricType,
        totalQuantity: record.quantity,
        periodStart: options.periodStart ?? '',
        periodEnd: options.periodEnd ?? '',
      });
    }

    return [...buckets.values()];
  }

  async export(options: UsageExportOptions): Promise<{ format: string; records: UsageRecord[] }> {
    const records = this.filterRecords(options);
    return { format: options.format ?? 'json', records };
  }

  supportedMetricTypes(): readonly UsageMetricType[] {
    return METRIC_TYPES;
  }

  private filterRecords(options: {
    ownerId?: string;
    workspaceId?: string;
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): UsageRecord[] {
    return this.records.filter((record) => {
      if (options.ownerId && record.ownerId !== options.ownerId) return false;
      if (options.workspaceId && record.workspaceId !== options.workspaceId) return false;
      if (options.organizationId && record.organizationId !== options.organizationId) return false;
      if (options.periodStart && record.occurredAt < options.periodStart) return false;
      if (options.periodEnd && record.occurredAt > options.periodEnd) return false;
      return true;
    });
  }
}
