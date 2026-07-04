import type { SyncCursor } from './client-sync.types.js';

export interface SyncCursorKey {
  ownerId: string;
  workspaceId?: string;
  platformId: string;
}

/** Per-client incremental sync watermark store. */
export interface ISyncCursorStore {
  get(key: SyncCursorKey): Promise<SyncCursor | null>;
  upsert(cursor: SyncCursor): Promise<void>;
}
