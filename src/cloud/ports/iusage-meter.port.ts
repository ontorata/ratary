import type {
  UsageAggregate,
  UsageExportOptions,
  UsageMetricType,
  UsageRecord,
} from '../types/usage.types.js';

/** Event-driven usage aggregation for billing export (ADR-033). */
export interface IUsageMeter {
  recordUsage(record: Omit<UsageRecord, 'id'>): Promise<void>;
  aggregate(options: {
    ownerId?: string;
    workspaceId?: string;
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<UsageAggregate[]>;
  export(options: UsageExportOptions): Promise<{ format: string; records: UsageRecord[] }>;
  supportedMetricTypes(): readonly UsageMetricType[];
}
