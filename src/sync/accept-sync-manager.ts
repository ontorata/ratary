import type { AuditRepository } from '../auth/audit.repository.js';
import type { D1Client } from '../db/d1-client.js';
import { hasWorkspaceScope } from '../types/memory-scope.js';
import type {
  ISyncManager,
  MemoryWriteEvent,
  SyncReconcileResult,
} from './isync-manager.interface.js';

interface MemoryTimestampRow {
  updated_at: string;
}

/**
 * MVP sync manager — last-write-wins with stale `updated_at` conflict audit (ADR-007).
 */
export class AcceptSyncManager implements ISyncManager {
  constructor(
    private readonly db: D1Client,
    private readonly audit: AuditRepository,
  ) {}

  async reconcileWrite(event: MemoryWriteEvent): Promise<SyncReconcileResult> {
    if (this.shouldCheckStale(event)) {
      const actualUpdatedAt = await this.getMemoryUpdatedAt(event);
      if (actualUpdatedAt && actualUpdatedAt !== event.expectedUpdatedAt) {
        await this.audit.append({
          event: 'sync.conflict',
          ownerId: event.scope.ownerId,
          resource: 'memory',
          resourceId: event.memoryId,
          metadata: {
            operation: event.operation,
            expectedUpdatedAt: event.expectedUpdatedAt,
            actualUpdatedAt,
            workspaceId: event.scope.workspaceId,
            agentId: event.scope.agentId,
          },
        });
      }
    }

    return 'accept';
  }

  private shouldCheckStale(event: MemoryWriteEvent): boolean {
    if (!event.expectedUpdatedAt) {
      return false;
    }

    return event.operation === 'update' || event.operation === 'delete';
  }

  private async getMemoryUpdatedAt(event: MemoryWriteEvent): Promise<string | null> {
    const { scope, memoryId } = event;
    const params: unknown[] = [memoryId, scope.ownerId];
    let sql = 'SELECT updated_at FROM memories WHERE id = ? AND owner_id = ? AND archived = 0';

    if (hasWorkspaceScope(scope)) {
      sql += ' AND workspace_id = ?';
      params.push(scope.workspaceId);
    }

    const rows = await this.db.query<MemoryTimestampRow>(sql, params);
    return rows[0]?.updated_at ?? null;
  }
}
