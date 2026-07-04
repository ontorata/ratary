import type { ContentScaleSyncInput, ContentScaleSyncStats } from '../types/sync.types.js';

/** R2/S3 content offload sync (Phase 22A). */
export interface IContentOffloadSyncer {
  sync(input: ContentScaleSyncInput): Promise<ContentScaleSyncStats>;
  isConfigured(): boolean;
}

/** pgvector production sync (Phase 22B). */
export interface IPgvectorIndexSyncer {
  sync(input: ContentScaleSyncInput): Promise<ContentScaleSyncStats>;
  isConfigured(): boolean;
}

/** Embedding batch job runner (Phase 22C). */
export interface IEmbeddingJobSyncer {
  sync(input: ContentScaleSyncInput): Promise<ContentScaleSyncStats>;
  isConfigured(): boolean;
}
