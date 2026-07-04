import type { AuditRepository } from '../auth/audit.repository.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type {
  ISyncManager,
  MemoryWriteEvent,
  SyncReconcileResult,
} from './isync-manager.interface.js';
import { SyncStaleDetector } from './sync-stale-detector.js';

/**
 * MVP sync manager — last-write-wins with stale `updated_at` conflict audit (ADR-007).
 */
export class AcceptSyncManager implements ISyncManager {
  private readonly staleDetector: SyncStaleDetector;

  constructor(
    db: ISqlDatabase,
    audit: AuditRepository,
  ) {
    this.staleDetector = new SyncStaleDetector(db, audit);
  }

  async reconcileWrite(event: MemoryWriteEvent): Promise<SyncReconcileResult> {
    await this.staleDetector.detect(event);
    return 'accept';
  }
}
