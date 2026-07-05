import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IObjectStorage } from '../ports/storage/iobject-storage.port.js';
import type { IVectorStore } from '../ports/vector/ivector-store.port.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import type { EmbeddingJobRunner } from '../embedding/embedding-job.runner.js';
import {
  ObjectStorageContentOffloadSyncer,
  NoOpContentOffloadSyncer,
  PgvectorIndexSyncer,
  NoOpPgvectorIndexSyncer,
  EmbeddingJobSyncer,
  NoOpEmbeddingJobSyncer,
  ContentScaleOrchestrator,
  ContentScaleManifestBuilder,
} from '../content-scale-platform/index.js';
import {
  SqlContentScaleSyncStore,
  NoOpContentScaleSyncStore,
} from '../infrastructure/content-scale-platform/sql-content-scale-sync-store.js';

export interface ContentScalePorts {
  enabled: boolean;
  orchestrator: ContentScaleOrchestrator;
  manifestBuilder: ContentScaleManifestBuilder;
  recordSyncLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    target: 'content' | 'pgvector' | 'embedding',
    status: 'completed' | 'failed',
  ): void;
}

/**
 * Composition root for Phase 22 content & vector scale platform (ADR-021).
 * Gated by CONTENT_SCALE_PLATFORM_ENABLED — default off preserves inline/D1 behavior.
 */
export function createContentScalePorts(
  sql: ISqlDatabase,
  env: Env,
  deps: {
    objectStorage: IObjectStorage;
    vectorStore: IVectorStore;
    embeddingJobRunner: EmbeddingJobRunner;
  },
): ContentScalePorts {
  const noopContent = new NoOpContentOffloadSyncer();
  const noopPgvector = new NoOpPgvectorIndexSyncer();
  const noopEmbedding = new NoOpEmbeddingJobSyncer();
  const noopStore = new NoOpContentScaleSyncStore();

  const noop: ContentScalePorts = {
    enabled: false,
    orchestrator: new ContentScaleOrchestrator(noopContent, noopPgvector, noopEmbedding, noopStore),
    manifestBuilder: new ContentScaleManifestBuilder(
      env,
      noopStore,
      noopContent,
      noopPgvector,
      noopEmbedding,
    ),
    recordSyncLifecycle: () => undefined,
  };

  if (!env.CONTENT_SCALE_PLATFORM_ENABLED) {
    return noop;
  }

  const store = new SqlContentScaleSyncStore(sql);
  const contentSyncer = new ObjectStorageContentOffloadSyncer(sql, env, deps.objectStorage);
  const pgvectorSyncer = new PgvectorIndexSyncer(sql, env, deps.vectorStore);
  const embeddingSyncer = new EmbeddingJobSyncer(sql, env, deps.embeddingJobRunner);
  const orchestrator = new ContentScaleOrchestrator(contentSyncer, pgvectorSyncer, embeddingSyncer, store);
  const manifestBuilder = new ContentScaleManifestBuilder(
    env,
    store,
    contentSyncer,
    pgvectorSyncer,
    embeddingSyncer,
  );

  return {
    enabled: true,
    orchestrator,
    manifestBuilder,
    recordSyncLifecycle(metricsExporter, target, status) {
      if (!metricsExporter) return;
      metricsExporter.incrementCounter({
        name: 'ratary_content_scale_sync_total',
        labels: { target, status },
      });
    },
  };
}
