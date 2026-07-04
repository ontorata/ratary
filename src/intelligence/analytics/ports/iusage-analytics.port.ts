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

export interface CostReport {
  estimatedTokens: number;
  modelInvocations: number;
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
