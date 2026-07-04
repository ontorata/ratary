import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache } from '../../src/config/index.js';
import { UsageAnalyticsService } from '../../src/intelligence/analytics/services/usage-analytics.service.js';
import type { IIntelligenceStore } from '../../src/intelligence/sync/ports/iglobal-sync.port.js';
import type { TelemetryEnvelope } from '../../src/intelligence/telemetry/types/telemetry-event.js';
import type { MemoryScope } from '../../src/types/memory-scope.js';
import type { GlobalSyncStatus } from '../../src/intelligence/sync/types/sync.types.js';

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
});
