import { nowISO } from '../../utils/memory-mapper.js';
import type { ISearchIndexSyncer } from '../ports/isearch-index-syncer.port.js';
import type { IGraphIndexSyncer } from '../ports/igraph-index-syncer.port.js';
import type { ISearchGraphSyncStore } from '../ports/isearch-graph-sync-store.port.js';
import type {
  SearchGraphSyncInput,
  SearchGraphSyncRun,
  SearchGraphSyncTarget,
} from '../types/sync.types.js';
import { newSyncRunId } from '../../infrastructure/search-graph-platform/sql-search-graph-sync-store.js';

/** Orchestrates search/graph production sync jobs (Phase 21). */
export class SearchGraphOrchestrator {
  constructor(
    private readonly searchSyncer: ISearchIndexSyncer,
    private readonly graphSyncer: IGraphIndexSyncer,
    private readonly store: ISearchGraphSyncStore,
  ) {}

  async syncSearch(input: SearchGraphSyncInput): Promise<SearchGraphSyncRun> {
    return this.runSync('meilisearch', this.searchSyncer, input);
  }

  async syncGraph(input: SearchGraphSyncInput): Promise<SearchGraphSyncRun> {
    return this.runSync('neo4j', this.graphSyncer, input);
  }

  async listRuns(limit?: number): Promise<SearchGraphSyncRun[]> {
    return this.store.listRuns(limit);
  }

  async getSyncState(target: SearchGraphSyncTarget) {
    return this.store.getState(target);
  }

  private async runSync(
    target: SearchGraphSyncTarget,
    syncer: ISearchIndexSyncer | IGraphIndexSyncer,
    input: SearchGraphSyncInput,
  ): Promise<SearchGraphSyncRun> {
    if (!syncer.isConfigured()) {
      throw new Error(`${target} sync is not configured — check env credentials`);
    }

    const runId = newSyncRunId();
    const startedAt = nowISO();
    const emptyStats = {
      scanned: 0,
      applied: 0,
      skipped: 0,
      failed: 0,
      dryRun: input.dryRun ?? false,
    };

    await this.store.startRun({
      id: runId,
      target,
      mode: input.mode,
      status: 'running',
      ownerId: input.ownerId,
      stats: emptyStats,
      startedAt,
    });

    const state = input.mode === 'incremental' ? await this.store.getState(target) : null;
    const syncInput: SearchGraphSyncInput = {
      ...input,
      sinceWatermark: state?.lastWatermark,
    };

    try {
      const stats = await syncer.sync(syncInput);
      const finishedAt = nowISO();
      const run: SearchGraphSyncRun = {
        id: runId,
        target,
        mode: input.mode,
        status: 'completed',
        ownerId: input.ownerId,
        stats,
        startedAt,
        finishedAt,
      };
      await this.store.completeRun(runId, {
        status: 'completed',
        stats,
        finishedAt,
      });
      if (!input.dryRun) {
        await this.store.setWatermark(target, finishedAt, runId);
      }
      return run;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const finishedAt = nowISO();
      await this.store.completeRun(runId, {
        status: 'failed',
        stats: emptyStats,
        finishedAt,
        errorMessage: message,
      });
      throw error;
    }
  }
}
