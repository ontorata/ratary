import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IVectorStore } from '../../ports/vector/ivector-store.port.js';
import { backfillPgvector } from '../../backfill/pgvector-backfill.js';
import type { IPgvectorIndexSyncer } from '../ports/index.js';
import type { ContentScaleSyncInput, ContentScaleSyncStats } from '../types/sync.types.js';

/** pgvector production sync adapter (Phase 22B). */
export class PgvectorIndexSyncer implements IPgvectorIndexSyncer {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly env: Env,
    private readonly vectorStore: IVectorStore,
  ) {}

  isConfigured(): boolean {
    return this.env.VECTOR_PROVIDER === 'pgvector';
  }

  async sync(input: ContentScaleSyncInput): Promise<ContentScaleSyncStats> {
    if (!this.isConfigured()) {
      throw new Error('VECTOR_PROVIDER=pgvector is required for pgvector sync');
    }

    const result = await backfillPgvector({
      source: this.sql,
      vectorStore: this.vectorStore,
      ownerId: input.ownerId,
      batchSize: input.batchSize ?? 100,
      dryRun: input.dryRun ?? false,
    });

    return {
      scanned: result.scanned,
      applied: result.upserted,
      skipped: result.skipped,
      failed: result.failed,
      dryRun: result.dryRun,
    };
  }
}

export class NoOpPgvectorIndexSyncer implements IPgvectorIndexSyncer {
  isConfigured(): boolean {
    return false;
  }

  async sync(): Promise<ContentScaleSyncStats> {
    throw new Error('Content scale platform disabled');
  }
}
