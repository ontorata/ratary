export type UsageMetricType =
  | 'memory.created'
  | 'memory.updated'
  | 'memory.deleted'
  | 'memory.accessed'
  | 'search.query'
  | 'embedding.request'
  | 'federation.egress';

export interface UsageRecord {
  id: string;
  ownerId: string;
  workspaceId?: string;
  organizationId?: string;
  metricType: UsageMetricType;
  quantity: number;
  occurredAt: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export interface UsageAggregate {
  ownerId: string;
  workspaceId?: string;
  organizationId?: string;
  metricType: UsageMetricType;
  totalQuantity: number;
  periodStart: string;
  periodEnd: string;
}

export interface UsageExportOptions {
  organizationId?: string;
  ownerId?: string;
  workspaceId?: string;
  periodStart?: string;
  periodEnd?: string;
  format?: 'json';
}
