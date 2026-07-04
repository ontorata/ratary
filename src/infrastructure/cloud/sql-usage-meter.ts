import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';
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

interface UsageRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  organization_id: string | null;
  metric_type: string;
  quantity: number;
  occurred_at: string;
  correlation_id: string | null;
  metadata: string;
}

function mapUsage(row: UsageRow): UsageRecord {
  let metadata: Record<string, unknown> | undefined;
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    metadata = undefined;
  }
  return {
    id: row.id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id ?? undefined,
    organizationId: row.organization_id ?? undefined,
    metricType: row.metric_type as UsageMetricType,
    quantity: row.quantity,
    occurredAt: row.occurred_at,
    correlationId: row.correlation_id ?? undefined,
    metadata,
  };
}

/** SQL-backed usage meter (Phase 18). */
export class SqlUsageMeter implements IUsageMeter {
  constructor(private readonly sql: ISqlDatabase) {}

  async recordUsage(record: Omit<UsageRecord, 'id'>): Promise<void> {
    const id = randomUUID();
    try {
      await this.sql.execute(
        `INSERT INTO cloud_usage_records
         (id, owner_id, workspace_id, organization_id, metric_type, quantity, occurred_at, correlation_id, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          record.ownerId,
          record.workspaceId ?? null,
          record.organizationId ?? null,
          record.metricType,
          record.quantity,
          record.occurredAt,
          record.correlationId ?? null,
          JSON.stringify(record.metadata ?? {}),
        ],
      );
    } catch {
      // Idempotent on duplicate correlation_id if retried
    }
  }

  async aggregate(options: {
    ownerId?: string;
    workspaceId?: string;
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<UsageAggregate[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.ownerId) {
      conditions.push('owner_id = ?');
      params.push(options.ownerId);
    }
    if (options.workspaceId) {
      conditions.push('workspace_id = ?');
      params.push(options.workspaceId);
    }
    if (options.organizationId) {
      conditions.push('organization_id = ?');
      params.push(options.organizationId);
    }
    if (options.periodStart) {
      conditions.push('occurred_at >= ?');
      params.push(options.periodStart);
    }
    if (options.periodEnd) {
      conditions.push('occurred_at <= ?');
      params.push(options.periodEnd);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.sql.query<{
      owner_id: string;
      workspace_id: string | null;
      organization_id: string | null;
      metric_type: string;
      total_quantity: number;
    }>(
      `SELECT owner_id, workspace_id, organization_id, metric_type, SUM(quantity) AS total_quantity
       FROM cloud_usage_records ${where}
       GROUP BY owner_id, workspace_id, organization_id, metric_type`,
      params,
    );

    return rows.map((row) => ({
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      organizationId: row.organization_id ?? undefined,
      metricType: row.metric_type as UsageMetricType,
      totalQuantity: row.total_quantity,
      periodStart: options.periodStart ?? '',
      periodEnd: options.periodEnd ?? '',
    }));
  }

  async export(options: UsageExportOptions): Promise<{ format: string; records: UsageRecord[] }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.ownerId) {
      conditions.push('owner_id = ?');
      params.push(options.ownerId);
    }
    if (options.workspaceId) {
      conditions.push('workspace_id = ?');
      params.push(options.workspaceId);
    }
    if (options.organizationId) {
      conditions.push('organization_id = ?');
      params.push(options.organizationId);
    }
    if (options.periodStart) {
      conditions.push('occurred_at >= ?');
      params.push(options.periodStart);
    }
    if (options.periodEnd) {
      conditions.push('occurred_at <= ?');
      params.push(options.periodEnd);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.sql.query<UsageRow>(
      `SELECT id, owner_id, workspace_id, organization_id, metric_type, quantity, occurred_at, correlation_id, metadata
       FROM cloud_usage_records ${where} ORDER BY occurred_at`,
      params,
    );

    return { format: options.format ?? 'json', records: rows.map(mapUsage) };
  }

  supportedMetricTypes(): readonly UsageMetricType[] {
    return METRIC_TYPES;
  }
}
