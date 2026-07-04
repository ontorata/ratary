import type { SearchGraphSyncInput, SearchGraphSyncStats } from '../types/sync.types.js';

/** External search index sync (Meilisearch) — ADR-022 Phase 21A. */
export interface ISearchIndexSyncer {
  sync(input: SearchGraphSyncInput): Promise<SearchGraphSyncStats>;
  isConfigured(): boolean;
}
