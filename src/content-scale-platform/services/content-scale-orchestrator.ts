import { nowISO } from '../../utils/memory-mapper.js';
import type {
  IContentOffloadSyncer,
  IEmbeddingJobSyncer,
  IPgvectorIndexSyncer,
} from '../ports/index.js';
import type { IContentScaleSyncStore } from '../ports/icontent-scale-sync-store.port.js';
import type {
  ContentScaleSyncInput,
  ContentScaleSyncRun,
  ContentScaleSyncTarget,
} from '../types/sync.types.js';
import { newContentScaleSyncRunId } from '../../infrastructure/content-scale-platform/sql-content-scale-sync-store.js';

type ScaleSyncer = IContentOffloadSyncer | IPgvectorIndexSyncer | IEmbeddingJobSyncer;

/** Orchestrates content/vector scale jobs (Phase 22). */
export class ContentScaleOrchestrator {
  constructor(
    private readonly contentSyncer: IContentOffloadSyncer,
    private readonly pgvectorSyncer: IPgvectorIndexSyncer,
    private readonly embeddingSyncer: IEmbeddingJobSyncer,
    private readonly store: IContentScaleSyncStore,
  ) {}

  async syncContent(input: ContentScaleSyncInput): Promise<ContentScaleSyncRun> {
    return this.runSync('content', this.contentSyncer, input);
  }

  async syncPgvector(input: ContentScaleSyncInput): Promise<ContentScaleSyncRun> {
    return this.runSync('pgvector', this.pgvectorSyncer, input);
  }

  async syncEmbeddings(input: ContentScaleSyncInput): Promise<ContentScaleSyncRun> {
    return this.runSync('embedding', this.embeddingSyncer, input);
  }

  async listRuns(limit?: number): Promise<ContentScaleSyncRun[]> {
    return this.store.listRuns(limit);
  }

  async getSyncState(target: ContentScaleSyncTarget) {
    return this.store.getState(target);
  }

  private async runSync(
    target: ContentScaleSyncTarget,
    syncer: ScaleSyncer,
    input: ContentScaleSyncInput,
  ): Promise<ContentScaleSyncRun> {
    if (!syncer.isConfigured()) {
      throw new Error(`${target} sync is not configured — check env credentials`);
    }

    const runId = newContentScaleSyncRunId();
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
    const syncInput: ContentScaleSyncInput = {
      ...input,
      sinceWatermark: state?.lastWatermark,
    };

    try {
      const stats = await syncer.sync(syncInput);
      const finishedAt = nowISO();
      const run: ContentScaleSyncRun = {
        id: runId,
        target,
        mode: input.mode,
        status: 'completed',
        ownerId: input.ownerId,
        stats,
        startedAt,
        finishedAt,
      };
      await this.store.completeRun(runId, { status: 'completed', stats, finishedAt });
      if (!input.dryRun && target !== 'embedding') {
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
