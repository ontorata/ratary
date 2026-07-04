import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache } from '../../src/config/index.js';
import { UsageAnalyticsService } from '../../src/intelligence/analytics/services/usage-analytics.service.js';
import type { IUsageCostMeter } from '../../src/intelligence/analytics/ports/iusage-cost-meter.port.js';
import type { IIntelligenceStore } from '../../src/intelligence/sync/ports/iglobal-sync.port.js';
import type { TelemetryEnvelope } from '../../src/intelligence/telemetry/types/telemetry-event.js';
import type { MemoryScope } from '../../src/types/memory-scope.js';
import type { GlobalSyncStatus } from '../../src/intelligence/sync/types/sync.types.js';
import { InMemoryUsageMeter } from '../../src/cloud/adapters/in-memory-usage-meter.js';

class InMemoryIntelligenceStore implements IIntelligenceStore {
  private readonly events: TelemetryEnvelope[] = [];

  async persistTelemetry(envelope: TelemetryEnvelope): Promise<void> {
    this.events.push(envelope);
  }

  async countTelemetry(scope: MemoryScope, since?: string): Promise<number> {
    return this.events.filter(
      (event) =>
        event.scope.ownerId === scope.ownerId &&
        (!since || event.occurredAt >= since),
    ).length;
  }

  async countTelemetryByType(scope: MemoryScope, type: string, since?: string): Promise<number> {
    return this.events.filter(
      (event) =>
        event.type === type &&
        event.scope.ownerId === scope.ownerId &&
        (!since || event.occurredAt >= since),
    ).length;
  }

  async setSyncCursor(): Promise<void> {
    return undefined;
  }

  async getSyncStatus(): Promise<GlobalSyncStatus> {
    return { tiers: {} };
  }
}

describe('Usage analytics service', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('derives adoption metrics from persisted telemetry', async () => {
    const store = new InMemoryIntelligenceStore();
    const scope = { ownerId: 'owner-1' };
    const now = new Date().toISOString();

    await store.persistTelemetry({
      eventId: 'e1',
      type: 'AgentConnected',
      occurredAt: now,
      scope,
      nodeId: 'node-1',
      attributes: { type: 'AgentConnected' },
      redaction: 'none',
      payload: { type: 'AgentConnected', agentId: 'a1' },
    });
    await store.persistTelemetry({
      eventId: 'e2',
      type: 'MemoryCreated',
      occurredAt: now,
      scope,
      nodeId: 'node-1',
      attributes: { type: 'MemoryCreated' },
      redaction: 'none',
      payload: { type: 'MemoryCreated', memoryId: 'm1' },
    });

    const analytics = new UsageAnalyticsService(store);
    const window = {
      from: new Date(Date.now() - 86400000).toISOString(),
      to: new Date(Date.now() + 86400000).toISOString(),
    };
    const report = await analytics.adoption(scope, window);
    expect(report.eventCount).toBeGreaterThanOrEqual(2);
    expect(report.activeAgents).toBe(1);
  });

  it('derives meter-backed cost from Phase 18 usage meter when enabled', async () => {
    const store = new InMemoryIntelligenceStore();
    const meter = new InMemoryUsageMeter();
    const scope: MemoryScope = { ownerId: 'owner-1', workspaceId: 'ws-1' };
    const window = {
      from: new Date(Date.now() - 86400000).toISOString(),
      to: new Date(Date.now() + 86400000).toISOString(),
    };
    const now = new Date().toISOString();

    await meter.recordUsage({
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      metricType: 'embedding.request',
      quantity: 3,
      occurredAt: now,
    });
    await meter.recordUsage({
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      metricType: 'search.query',
      quantity: 2,
      occurredAt: now,
    });

    const analytics = new UsageAnalyticsService(store, meter, true);
    const report = await analytics.cost(scope, window);

    expect(report.source).toBe('meter');
    expect(report.totalUsageUnits).toBe(5);
    expect(report.usageByMetric).toEqual({
      'embedding.request': 3,
      'search.query': 2,
    });
    expect(report.modelInvocations).toBe(3);
    expect(report.estimatedTokens).toBe(0);
  });

  it('falls back to telemetry estimate when usage meter is disabled', async () => {
    const store = new InMemoryIntelligenceStore();
    const scope: MemoryScope = { ownerId: 'owner-1' };
    const now = new Date().toISOString();
    const window = {
      from: new Date(Date.now() - 86400000).toISOString(),
      to: new Date(Date.now() + 86400000).toISOString(),
    };

    await store.persistTelemetry({
      eventId: 'e-model',
      type: 'ModelInvoked',
      occurredAt: now,
      scope,
      nodeId: 'node-1',
      attributes: { type: 'ModelInvoked' },
      redaction: 'none',
      payload: { type: 'ModelInvoked', providerLabel: 'openai', operation: 'embed' },
    });

    const meter: IUsageCostMeter = {
      aggregate: vi.fn().mockResolvedValue([]),
    };
    const analytics = new UsageAnalyticsService(store, meter, false);
    const report = await analytics.cost(scope, window);

    expect(report.source).toBe('telemetry_estimate');
    expect(report.modelInvocations).toBe(1);
    expect(report.estimatedTokens).toBe(512);
    expect(meter.aggregate).not.toHaveBeenCalled();
  });
});
