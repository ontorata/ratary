export type ContentScaleSyncTarget = 'content' | 'pgvector' | 'embedding';

export type ContentScaleSyncMode = 'full' | 'incremental';

export type ContentScaleSyncStatus = 'running' | 'completed' | 'failed';

export interface ContentScaleSyncStats {
  scanned: number;
  applied: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface ContentScaleSyncRun {
  id: string;
  target: ContentScaleSyncTarget;
  mode: ContentScaleSyncMode;
  status: ContentScaleSyncStatus;
  ownerId?: string;
  stats: ContentScaleSyncStats;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface ContentScaleSyncState {
  target: ContentScaleSyncTarget;
  lastWatermark: string;
  lastRunId?: string;
  updatedAt: string;
}

export interface ContentScaleSyncInput {
  mode: ContentScaleSyncMode;
  ownerId?: string;
  dryRun?: boolean;
  batchSize?: number;
  sinceWatermark?: string;
  forceReembed?: boolean;
  projectId?: string;
  clearInline?: boolean;
}

export interface ContentScalePlatformManifest {
  platform: 'content-vector-scale';
  objectStorageProvider: string;
  vectorProvider: string;
  embeddingProvider: string;
  contentOffloadConfigured: boolean;
  pgvectorConfigured: boolean;
  embeddingJobConfigured: boolean;
  contentOffloadMinBytes: number;
  supportsIncrementalSync: boolean;
  lastRuns: Partial<
    Record<ContentScaleSyncTarget, Pick<ContentScaleSyncRun, 'id' | 'status' | 'finishedAt'>>
  >;
}
