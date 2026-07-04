/** Minimal Phase 18 meter surface for cost KPI derivation (ADR-038 + ADR-033). */
export interface UsageCostAggregate {
  metricType: string;
  totalQuantity: number;
}

export interface IUsageCostMeter {
  aggregate(options: {
    ownerId?: string;
    workspaceId?: string;
    organizationId?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<UsageCostAggregate[]>;
}
