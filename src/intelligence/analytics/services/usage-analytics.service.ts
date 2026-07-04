import type { MemoryScope } from '../../../types/memory-scope.js';
import type { IUsageCostMeter } from '../ports/iusage-cost-meter.port.js';
import type {
  AdoptionReport,
  ContextReport,
  CostReport,
  HealthScore,
  IUsageAnalyticsService,
  TimeWindow,
} from '../ports/iusage-analytics.port.js';
import type { IIntelligenceStore } from '../../sync/ports/iglobal-sync.port.js';

const TELEMETRY_TOKEN_ESTIMATE_PER_INVOCATION = 512;

function inWindow(iso: string, window: TimeWindow): boolean {
  return iso >= window.from && iso <= window.to;
}

function scopeToMeterQuery(scope: MemoryScope, window: TimeWindow) {
  return {
    ownerId: scope.ownerId,
    workspaceId: scope.workspaceId,
    organizationId: scope.organizationId,
    periodStart: window.from,
    periodEnd: window.to,
  };
}

function buildMeterCostReport(aggregates: Array<{ metricType: string; totalQuantity: number }>): CostReport {
  const usageByMetric: Record<string, number> = {};
  let totalUsageUnits = 0;

  for (const aggregate of aggregates) {
    usageByMetric[aggregate.metricType] =
      (usageByMetric[aggregate.metricType] ?? 0) + aggregate.totalQuantity;
    totalUsageUnits += aggregate.totalQuantity;
  }

  const embeddingRequests = usageByMetric['embedding.request'] ?? 0;

  return {
    source: 'meter',
    estimatedTokens: 0,
    modelInvocations: embeddingRequests,
    totalUsageUnits,
    usageByMetric,
  };
}

export class UsageAnalyticsService implements IUsageAnalyticsService {
  constructor(
    private readonly store: IIntelligenceStore,
    private readonly usageMeter?: IUsageCostMeter,
    private readonly usageMeterEnabled = false,
  ) {}

  async adoption(scope: MemoryScope, window: TimeWindow): Promise<AdoptionReport> {
    const eventCount = await this.store.countTelemetry(scope, window.from);
    const agents = await this.store.countTelemetryByType(scope, 'AgentConnected', window.from);
    const sessions = await this.store.countTelemetryByType(scope, 'SDKConnected', window.from);
    return {
      activeAgents: agents,
      activeSessions: sessions,
      eventCount,
    };
  }

  async workspaceHealth(scope: MemoryScope, window: TimeWindow): Promise<HealthScore> {
    const adoption = await this.adoption(scope, window);
    const sync = await this.store.getSyncStatus(scope);
    const tierEntries = Object.values(sync.tiers);
    const fresh =
      tierEntries.length === 0
        ? 0.5
        : tierEntries.filter((t) => t?.lastSyncAt && inWindow(t.lastSyncAt, window)).length /
          tierEntries.length;
    const searches = await this.store.countTelemetryByType(scope, 'SearchExecuted', window.from);
    const accesses = await this.store.countTelemetryByType(scope, 'MemoryAccessed', window.from);
    const retrievalSuccess = searches === 0 ? 1 : Math.min(1, accesses / searches);
    const adoptionScore = Math.min(1, adoption.eventCount / 100);
    const score = (adoptionScore + fresh + retrievalSuccess) / 3;
    return {
      score: Math.round(score * 100) / 100,
      adoption: adoptionScore,
      syncFreshness: fresh,
      retrievalSuccess,
    };
  }

  async cost(scope: MemoryScope, window: TimeWindow): Promise<CostReport> {
    if (this.usageMeterEnabled && this.usageMeter) {
      const aggregates = await this.usageMeter.aggregate(scopeToMeterQuery(scope, window));
      return buildMeterCostReport(aggregates);
    }

    const modelInvocations = await this.store.countTelemetryByType(
      scope,
      'ModelInvoked',
      window.from,
    );
    return {
      source: 'telemetry_estimate',
      estimatedTokens: modelInvocations * TELEMETRY_TOKEN_ESTIMATE_PER_INVOCATION,
      modelInvocations,
    };
  }

  async contextEffectiveness(scope: MemoryScope, window: TimeWindow): Promise<ContextReport> {
    const buildCount = await this.store.countTelemetryByType(scope, 'ContextBuilt', window.from);
    const truncated = buildCount > 0 ? 0.1 : 0;
    return {
      avgTokensUsed: buildCount > 0 ? 2048 : 0,
      truncationRate: truncated,
      buildCount,
    };
  }
}

export class NoOpUsageAnalyticsService implements IUsageAnalyticsService {
  async adoption(): Promise<AdoptionReport> {
    return { activeAgents: 0, activeSessions: 0, eventCount: 0 };
  }

  async workspaceHealth(): Promise<HealthScore> {
    return { score: 0, adoption: 0, syncFreshness: 0, retrievalSuccess: 0 };
  }

  async cost(): Promise<CostReport> {
    return {
      source: 'telemetry_estimate',
      estimatedTokens: 0,
      modelInvocations: 0,
    };
  }

  async contextEffectiveness(): Promise<ContextReport> {
    return { avgTokensUsed: 0, truncationRate: 0, buildCount: 0 };
  }
}
