import type { SyncConflictRecord, SyncConflictStatus } from './client-sync.types.js';

export interface SyncConflictInsert {
  ownerId: string;
  workspaceId?: string;
  platformId: string;
  memoryId: string;
  payload: string;
}

/** Manual conflict queue for operator resolution (ADR-042). */
export interface ISyncConflictStore {
  insert(record: SyncConflictInsert): Promise<SyncConflictRecord>;
  countPending(filters: {
    ownerId: string;
    workspaceId?: string;
    platformId?: string;
  }): Promise<number>;
  listPending(filters: {
    ownerId: string;
    workspaceId?: string;
    platformId?: string;
    limit: number;
  }): Promise<SyncConflictRecord[]>;
  updateStatus(id: string, ownerId: string, status: SyncConflictStatus): Promise<void>;
}
