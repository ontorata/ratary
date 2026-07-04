import type { MemoryScope } from '../types/memory-scope.js';

/** Write event passed to sync reconciliation — MVP audit + accept/reject. */
export interface MemoryWriteEvent {
  scope: MemoryScope;
  memoryId: string;
  operation: 'create' | 'update' | 'delete';
  /** Client-known updatedAt before write — used for stale detection. */
  expectedUpdatedAt?: string | null;
}

export type SyncReconcileResult = 'accept' | 'reject';

/**
 * Cross-client write reconciliation — Phase 9 MVP accepts with conflict audit.
 * @see .ai/adr/007-multi-ai-workspace-scope.md
 */
export interface ISyncManager {
  reconcileWrite(event: MemoryWriteEvent): Promise<SyncReconcileResult>;
}
