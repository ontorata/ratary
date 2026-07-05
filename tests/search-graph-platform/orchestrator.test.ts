import { describe, it, expect, vi, afterEach } from 'vitest';
import { InMemorySearchGraphSyncStore } from '../../src/infrastructure/search-graph-platform/sql-search-graph-sync-store.js';
import { SearchGraphOrchestrator } from '../../src/search-graph-platform/services/search-graph-orchestrator.js';
import type { ISearchIndexSyncer } from '../../src/search-graph-platform/ports/isearch-index-syncer.port.js';
import type { IGraphIndexSyncer } from '../../src/search-graph-platform/ports/igraph-index-syncer.port.js';
import type { SearchGraphSyncInput, SearchGraphSyncStats } from '../../src/search-graph-platform/types/sync.types.js';

const stats: SearchGraphSyncStats = {
  scanned: 2,
  applied: 2,
  skipped: 0,
  failed: 0,
  dryRun: true,
};

class FakeSearchSyncer implements ISearchIndexSyncer {
  isConfigured(): boolean {
    return true;
  }
  async sync(_input: SearchGraphSyncInput): Promise<SearchGraphSyncStats> {
    return stats;
  }
}

class FakeGraphSyncer implements IGraphIndexSyncer {
  isConfigured(): boolean {
    return true;
  }
  async sync(_input: SearchGraphSyncInput): Promise<SearchGraphSyncStats> {
    return stats;
  }
}

describe('SearchGraphOrchestrator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('records completed search sync run', async () => {
    const store = new InMemorySearchGraphSyncStore();
    const orchestrator = new SearchGraphOrchestrator(
      new FakeSearchSyncer(),
      new FakeGraphSyncer(),
      store,
    );

    const run = await orchestrator.syncSearch({ mode: 'full', dryRun: true });
    expect(run.status).toBe('completed');
    expect(run.target).toBe('meilisearch');
    expect(run.stats.applied).toBe(2);

    const state = await store.getState('meilisearch');
    expect(state).toBeNull();
  });

  it('updates watermark after non-dry-run sync', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T12:00:00.000Z'));

    const store = new InMemorySearchGraphSyncStore();
    const orchestrator = new SearchGraphOrchestrator(
      new FakeSearchSyncer(),
      new FakeGraphSyncer(),
      store,
    );

    await orchestrator.syncGraph({ mode: 'incremental', dryRun: false });
    const state = await store.getState('neo4j');
    expect(state?.lastWatermark).toBe('2026-07-04T12:00:00.000Z');
  });
});
