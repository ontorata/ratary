import type { ISyncConflictStore } from './isync-conflict-store.port.js';
import type { IConflictResolver } from './iconflict-resolver.interface.js';
import type {
  ISyncManager,
  MemoryWriteEvent,
  SyncReconcileResult,
} from '../sync/isync-manager.interface.js';
import { SyncStaleDetector } from '../sync/sync-stale-detector.js';

/**
 * Conflict-aware sync manager — applies IConflictResolver when stale (ADR-042).
 * When not stale, always accepts. Audits stale attempts via SyncStaleDetector.
 */
export class ConflictAwareSyncManager implements ISyncManager {
  constructor(
    private readonly staleDetector: SyncStaleDetector,
    private readonly resolver: IConflictResolver,
    private readonly conflictStore?: ISyncConflictStore,
  ) {}

  async reconcileWrite(event: MemoryWriteEvent): Promise<SyncReconcileResult> {
    const detection = await this.staleDetector.detect(event);
    const resolution = await this.resolver.resolve({
      event,
      actualUpdatedAt: detection.actualUpdatedAt,
      isStale: detection.isStale,
    });

    if (resolution.queue && detection.isStale && this.conflictStore) {
      await this.conflictStore.insert({
        ownerId: event.scope.ownerId,
        workspaceId: event.scope.workspaceId,
        platformId: event.scope.agentId ?? 'unknown',
        memoryId: event.memoryId,
        payload: JSON.stringify({
          operation: event.operation,
          expectedUpdatedAt: event.expectedUpdatedAt,
          actualUpdatedAt: detection.actualUpdatedAt,
        }),
      });
    }

    return resolution.result;
  }
}
