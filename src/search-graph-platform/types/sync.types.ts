export type SearchGraphSyncTarget = 'meilisearch' | 'neo4j';

export type SearchGraphSyncMode = 'full' | 'incremental';

export type SearchGraphSyncStatus = 'running' | 'completed' | 'failed';

export interface SearchGraphSyncStats {
  scanned: number;
  applied: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface SearchGraphSyncRun {
  id: string;
  target: SearchGraphSyncTarget;
  mode: SearchGraphSyncMode;
  status: SearchGraphSyncStatus;
  ownerId?: string;
  stats: SearchGraphSyncStats;
  startedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface SearchGraphSyncState {
  target: SearchGraphSyncTarget;
  lastWatermark: string;
  lastRunId?: string;
  updatedAt: string;
}

export interface SearchGraphSyncInput {
  mode: SearchGraphSyncMode;
  ownerId?: string;
  dryRun?: boolean;
  batchSize?: number;
  sinceWatermark?: string;
}

export interface SearchGraphPlatformManifest {
  platform: 'search-graph-production';
  searchProvider: string;
  graphProvider: string;
  meilisearchConfigured: boolean;
  neo4jConfigured: boolean;
  graphVectorSeedsEnabled: boolean;
  supportsIncrementalSync: boolean;
  lastRuns: Partial<
    Record<SearchGraphSyncTarget, Pick<SearchGraphSyncRun, 'id' | 'status' | 'finishedAt'>>
  >;
}
