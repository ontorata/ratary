import { describe, it, expect, vi, afterEach } from 'vitest';
import { InMemoryContentScaleSyncStore } from '../../src/infrastructure/content-scale-platform/sql-content-scale-sync-store.js';
import { ContentScaleOrchestrator } from '../../src/content-scale-platform/services/content-scale-orchestrator.js';
import type { IContentOffloadSyncer, IEmbeddingJobSyncer, IPgvectorIndexSyncer } from '../../src/content-scale-platform/ports/index.js';
import type { ContentScaleSyncInput, ContentScaleSyncStats } from '../../src/content-scale-platform/types/sync.types.js';

const stats: ContentScaleSyncStats = {
  scanned: 3,
  applied: 2,
  skipped: 1,
  failed: 0,
  dryRun: true,
};

class FakeContentSyncer implements IContentOffloadSyncer {
  isConfigured(): boolean {
    return true;
  }
  async sync(_input: ContentScaleSyncInput): Promise<ContentScaleSyncStats> {
    return stats;
  }
}

class FakePgvectorSyncer implements IPgvectorIndexSyncer {
  isConfigured(): boolean {
    return true;
  }
  async sync(_input: ContentScaleSyncInput): Promise<ContentScaleSyncStats> {
    return stats;
  }
}

class FakeEmbeddingSyncer implements IEmbeddingJobSyncer {
  isConfigured(): boolean {
    return true;
  }
  async sync(_input: ContentScaleSyncInput): Promise<ContentScaleSyncStats> {
    return stats;
  }
}

describe('ContentScaleOrchestrator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('records completed content offload run', async () => {
    const store = new InMemoryContentScaleSyncStore();
    const orchestrator = new ContentScaleOrchestrator(
      new FakeContentSyncer(),
      new FakePgvectorSyncer(),
      new FakeEmbeddingSyncer(),
      store,
    );

    const run = await orchestrator.syncContent({ mode: 'full', dryRun: true });
    expect(run.status).toBe('completed');
    expect(run.target).toBe('content');
  });

  it('updates watermark after non-dry-run pgvector sync', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T14:00:00.000Z'));

    const store = new InMemoryContentScaleSyncStore();
    const orchestrator = new ContentScaleOrchestrator(
      new FakeContentSyncer(),
      new FakePgvectorSyncer(),
      new FakeEmbeddingSyncer(),
      store,
    );

    await orchestrator.syncPgvector({ mode: 'incremental', dryRun: false });
    const state = await store.getState('pgvector');
    expect(state?.lastWatermark).toBe('2026-07-04T14:00:00.000Z');
  });
});
