import type { MemoryScope } from '../../../types/memory-scope.js';

export interface TimeWindow {
  from: string;
  to: string;
}

export interface AdoptionReport {
  activeAgents: number;
  activeSessions: number;
  eventCount: number;
}

export interface HealthScore {
  score: number;
  adoption: number;
  syncFreshness: number;
  retrievalSuccess: number;
}

export type CostReportSource = 'meter' | 'telemetry_estimate';

export interface CostReport {
  /** `meter` when Phase 18 usage meter is enabled; otherwise telemetry heuristic. */
  source: CostReportSource;
  /** Heuristic token estimate (telemetry ModelInvoked × 512 when source=telemetry_estimate). */
  estimatedTokens: number;
  /** Model/embedding invocation count from telemetry or meter `embedding.request`. */
  modelInvocations: number;
  /** Sum of meter quantities when source=meter. */
  totalUsageUnits?: number;
  /** Phase 18 meter breakdown when source=meter. */
  usageByMetric?: Record<string, number>;
}

export interface ContextReport {
  avgTokensUsed: number;
  truncationRate: number;
  buildCount: number;
}

/** Read-only usage analytics derivations (Phase 25 / ADR-038). */
export interface IUsageAnalyticsService {
  adoption(scope: MemoryScope, window: TimeWindow): Promise<AdoptionReport>;
  workspaceHealth(scope: MemoryScope, window: TimeWindow): Promise<HealthScore>;
  cost(scope: MemoryScope, window: TimeWindow): Promise<CostReport>;
  contextEffectiveness(scope: MemoryScope, window: TimeWindow): Promise<ContextReport>;
}
