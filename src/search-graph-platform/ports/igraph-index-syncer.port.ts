import type { SearchGraphSyncInput, SearchGraphSyncStats } from '../types/sync.types.js';

/** External graph engine sync (Neo4j) — ADR-022 Phase 21B. */
export interface IGraphIndexSyncer {
  sync(input: SearchGraphSyncInput): Promise<SearchGraphSyncStats>;
  isConfigured(): boolean;
}
