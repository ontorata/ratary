import type { Env } from '../../config/env.js';
import type { EmbeddingJobRunner } from '../../embedding/embedding-job.runner.js';
import type { IEmbeddingJobSyncer } from '../ports/index.js';
import type { ContentScaleSyncInput, ContentScaleSyncStats } from '../types/sync.types.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';

/** Embedding batch job sync (Phase 22C). */
export class EmbeddingJobSyncer implements IEmbeddingJobSyncer {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly env: Env,
    private readonly runner: EmbeddingJobRunner,
  ) {}

  isConfigured(): boolean {
    return this.env.EMBEDDING_PROVIDER !== 'noop';
  }

  async sync(input: ContentScaleSyncInput): Promise<ContentScaleSyncStats> {
    if (!this.isConfigured()) {
      throw new Error('EMBEDDING_PROVIDER must not be noop for embedding jobs');
    }

    const owners = input.ownerId
      ? [{ owner_id: input.ownerId }]
      : await this.sql.query<{ owner_id: string }>(
          `SELECT DISTINCT owner_id FROM memories WHERE owner_id != ? AND archived = 0`,
          [''],
        );

    const stats: ContentScaleSyncStats = {
      scanned: 0,
      applied: 0,
      skipped: 0,
      failed: 0,
      dryRun: input.dryRun ?? false,
    };

    for (const { owner_id: ownerId } of owners) {
      const report = await this.runner.run({
        ownerId,
        projectId: input.projectId,
        batchSize: input.batchSize ?? this.env.EMBEDDING_BATCH_SIZE,
        dryRun: input.dryRun ?? false,
        forceReembed: input.forceReembed ?? false,
      });
      stats.scanned += report.scanned;
      stats.applied += report.embedded;
      stats.skipped += report.skipped;
      stats.failed += report.failed;
    }

    return stats;
  }
}

export class NoOpEmbeddingJobSyncer implements IEmbeddingJobSyncer {
  isConfigured(): boolean {
    return false;
  }

  async sync(): Promise<ContentScaleSyncStats> {
    throw new Error('Content scale platform disabled');
  }
}
