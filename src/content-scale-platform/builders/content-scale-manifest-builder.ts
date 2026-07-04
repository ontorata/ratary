import type { Env } from '../../config/env.js';
import type { IContentOffloadSyncer, IEmbeddingJobSyncer, IPgvectorIndexSyncer } from '../ports/index.js';
import type { IContentScaleSyncStore } from '../ports/icontent-scale-sync-store.port.js';
import type { ContentScalePlatformManifest } from '../types/sync.types.js';

export class ContentScaleManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly store: IContentScaleSyncStore,
    private readonly contentSyncer: IContentOffloadSyncer,
    private readonly pgvectorSyncer: IPgvectorIndexSyncer,
    private readonly embeddingSyncer: IEmbeddingJobSyncer,
  ) {}

  async build(): Promise<ContentScalePlatformManifest> {
    const [contentRun, pgvectorRun, embeddingRun] = await Promise.all([
      this.store.getLatestRun('content'),
      this.store.getLatestRun('pgvector'),
      this.store.getLatestRun('embedding'),
    ]);

    return {
      platform: 'content-vector-scale',
      objectStorageProvider: this.env.OBJECT_STORAGE_PROVIDER,
      vectorProvider: this.env.VECTOR_PROVIDER,
      embeddingProvider: this.env.EMBEDDING_PROVIDER,
      contentOffloadConfigured: this.contentSyncer.isConfigured(),
      pgvectorConfigured: this.pgvectorSyncer.isConfigured(),
      embeddingJobConfigured: this.embeddingSyncer.isConfigured(),
      contentOffloadMinBytes: this.env.CONTENT_OFFLOAD_MIN_BYTES,
      supportsIncrementalSync: true,
      lastRuns: {
        ...(contentRun
          ? { content: { id: contentRun.id, status: contentRun.status, finishedAt: contentRun.finishedAt } }
          : {}),
        ...(pgvectorRun
          ? { pgvector: { id: pgvectorRun.id, status: pgvectorRun.status, finishedAt: pgvectorRun.finishedAt } }
          : {}),
        ...(embeddingRun
          ? { embedding: { id: embeddingRun.id, status: embeddingRun.status, finishedAt: embeddingRun.finishedAt } }
          : {}),
      },
    };
  }
}
