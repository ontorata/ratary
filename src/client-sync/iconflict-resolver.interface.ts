import type { MemoryWriteEvent } from '../sync/isync-manager.interface.js';
import type { SyncReconcileResult } from '../sync/isync-manager.interface.js';

export interface ConflictResolutionContext {
  event: MemoryWriteEvent;
  actualUpdatedAt: string | null;
  isStale: boolean;
}

export interface ConflictResolution {
  result: SyncReconcileResult;
  queue?: boolean;
}

/** Strategy port for stale write reconciliation (ADR-042). */
export interface IConflictResolver {
  resolve(context: ConflictResolutionContext): Promise<ConflictResolution>;
}
