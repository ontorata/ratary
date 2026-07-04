import type { Memory } from '../types/memory.js';

export type SyncConflictStrategy = 'lww' | 'field_merge' | 'manual_queue';

export type SyncConflictStatus = 'pending' | 'resolved';

export interface SyncCursor {
  ownerId: string;
  workspaceId?: string;
  platformId: string;
  cursorValue: string;
  updatedAt: string;
}

export interface SyncConflictRecord {
  id: string;
  ownerId: string;
  workspaceId?: string;
  platformId: string;
  memoryId: string;
  payload: string;
  status: SyncConflictStatus;
  createdAt: string;
}

export interface PullChangesResult {
  memories: Memory[];
  nextCursor: string;
  hasMore: boolean;
}

export interface PushChangeItem {
  memoryId: string;
  operation: 'create' | 'update' | 'delete';
  expectedUpdatedAt?: string | null;
  data?: {
    title?: string;
    project?: string;
    content?: string;
    summary?: string;
    tags?: string[];
    favorite?: boolean;
  };
}

export interface PushChangesResult {
  accepted: number;
  rejected: number;
  queued: number;
  conflicts: Array<{ memoryId: string; reason: string }>;
}

export interface SyncStatusResult {
  platformId: string;
  strategy: SyncConflictStrategy;
  cursor: SyncCursor | null;
  pendingConflicts: number;
}

export interface ClientPlatformProfile {
  id: string;
  displayName: string;
  supportsIncrementalPull: boolean;
}
