import type { AuditRepository } from '../auth/audit.repository.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { hasWorkspaceScope } from '../types/memory-scope.js';
import type { MemoryWriteEvent } from './isync-manager.interface.js';

interface MemoryTimestampRow {
  updated_at: string;
}

export interface StaleDetectionResult {
  isStale: boolean;
  actualUpdatedAt: string | null;
}

/**
 * Shared stale `updated_at` detection and conflict audit for sync managers.
 */
export class SyncStaleDetector {
  constructor(
    private readonly db: ISqlDatabase,
    private readonly audit: AuditRepository,
  ) {}

  async detect(event: MemoryWriteEvent): Promise<StaleDetectionResult> {
    if (!this.shouldCheckStale(event)) {
      return { isStale: false, actualUpdatedAt: null };
    }

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
      return { isStale: true, actualUpdatedAt };
    }

    return { isStale: false, actualUpdatedAt };
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
