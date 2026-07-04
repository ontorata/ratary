import type { MemoryScope } from '../../../types/memory-scope.js';
import type {
  AdoptionReport,
  ContextReport,
  CostReport,
  HealthScore,
  IUsageAnalyticsService,
  TimeWindow,
} from '../ports/iusage-analytics.port.js';
import type { IIntelligenceStore } from '../../sync/ports/iglobal-sync.port.js';

function inWindow(iso: string, window: TimeWindow): boolean {
  return iso >= window.from && iso <= window.to;
}

export class UsageAnalyticsService implements IUsageAnalyticsService {
  constructor(private readonly store: IIntelligenceStore) {}

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
    const modelInvocations = await this.store.countTelemetryByType(
      scope,
      'ModelInvoked',
      window.from,
    );
    return {
      estimatedTokens: modelInvocations * 512,
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
    return { estimatedTokens: 0, modelInvocations: 0 };
  }

  async contextEffectiveness(): Promise<ContextReport> {
    return { avgTokensUsed: 0, truncationRate: 0, buildCount: 0 };
  }
}
