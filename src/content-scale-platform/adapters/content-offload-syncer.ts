import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IObjectStorage } from '../../ports/storage/iobject-storage.port.js';
import { backfillContentOffload } from '../../../scripts/lib/content-offload-backfill.js';
import type { IContentOffloadSyncer } from '../ports/index.js';
import type { ContentScaleSyncInput, ContentScaleSyncStats } from '../types/sync.types.js';

/** R2/S3 content offload adapter (Phase 22A). */
export class ObjectStorageContentOffloadSyncer implements IContentOffloadSyncer {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly env: Env,
    private readonly objectStorage: IObjectStorage,
  ) {}

  isConfigured(): boolean {
    return this.env.OBJECT_STORAGE_PROVIDER === 'r2' || this.env.OBJECT_STORAGE_PROVIDER === 's3';
  }

  async sync(input: ContentScaleSyncInput): Promise<ContentScaleSyncStats> {
    if (!this.isConfigured()) {
      throw new Error('OBJECT_STORAGE_PROVIDER must be r2 or s3 for content offload');
    }

    const result = await backfillContentOffload({
      source: this.sql,
      objectStorage: this.objectStorage,
      minBytes: this.env.CONTENT_OFFLOAD_MIN_BYTES,
      ownerId: input.ownerId,
      batchSize: input.batchSize ?? 50,
      dryRun: input.dryRun ?? false,
      clearInline: input.clearInline ?? this.env.CONTENT_OFFLOAD_CLEAR_INLINE,
      sinceUpdatedAt: input.mode === 'incremental' ? input.sinceWatermark : undefined,
    });

    return {
      scanned: result.scanned,
      applied: result.offloaded,
      skipped: result.skipped,
      failed: result.failed,
      dryRun: result.dryRun,
    };
  }
}

export class NoOpContentOffloadSyncer implements IContentOffloadSyncer {
  isConfigured(): boolean {
    return false;
  }

  async sync(): Promise<ContentScaleSyncStats> {
    throw new Error('Content scale platform disabled');
  }
}
