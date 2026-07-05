import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { TelemetryEnvelope } from '../../intelligence/telemetry/types/telemetry-event.js';
import type { GlobalSyncStatus } from '../../intelligence/sync/types/sync.types.js';
import type { IIntelligenceStore } from '../../intelligence/sync/ports/iglobal-sync.port.js';

interface SyncStateRow {
  scope_key: string;
  tier: string;
  owner_id: string;
  workspace_id: string | null;
  last_cursor: string | null;
  last_run_id: string | null;
  updated_at: string;
}

function scopeKey(scope: MemoryScope): string {
  return `${scope.ownerId}:${scope.workspaceId ?? ''}`;
}

/** SQL-backed telemetry + sync state store (Phase 25). */
export class SqlIntelligenceStore implements IIntelligenceStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async persistTelemetry(envelope: TelemetryEnvelope): Promise<void> {
    await this.sql.execute(
      `INSERT INTO intelligence_telemetry_events
       (id, event_type, owner_id, workspace_id, node_id, envelope_json, occurred_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        envelope.eventId,
        envelope.type,
        envelope.scope.ownerId ?? 'unknown',
        envelope.scope.workspaceId ?? null,
        envelope.nodeId,
        JSON.stringify(envelope),
        envelope.occurredAt,
      ],
    );
  }

  async countTelemetry(scope: MemoryScope, since?: string): Promise<number> {
    const rows = since
      ? await this.sql.query<{ count: number }>(
          `SELECT COUNT(*) AS count FROM intelligence_telemetry_events
           WHERE owner_id = ? AND (workspace_id IS ? OR workspace_id = ?) AND occurred_at >= ?`,
          [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null, since],
        )
      : await this.sql.query<{ count: number }>(
          `SELECT COUNT(*) AS count FROM intelligence_telemetry_events
           WHERE owner_id = ? AND (workspace_id IS ? OR workspace_id = ?)`,
          [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null],
        );
    return Number(rows[0]?.count ?? 0);
  }

  async countTelemetryByType(scope: MemoryScope, type: string, since?: string): Promise<number> {
    const rows = since
      ? await this.sql.query<{ count: number }>(
          `SELECT COUNT(*) AS count FROM intelligence_telemetry_events
           WHERE owner_id = ? AND (workspace_id IS ? OR workspace_id = ?)
             AND event_type = ? AND occurred_at >= ?`,
          [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null, type, since],
        )
      : await this.sql.query<{ count: number }>(
          `SELECT COUNT(*) AS count FROM intelligence_telemetry_events
           WHERE owner_id = ? AND (workspace_id IS ? OR workspace_id = ?) AND event_type = ?`,
          [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null, type],
        );
    return Number(rows[0]?.count ?? 0);
  }

  async setSyncCursor(
    scope: MemoryScope,
    tier: string,
    cursor: string,
    runId?: string,
  ): Promise<void> {
    const key = `${scopeKey(scope)}:${tier}`;
    const now = new Date().toISOString();
    await this.sql.execute(
      `INSERT INTO intelligence_sync_state
       (scope_key, tier, owner_id, workspace_id, last_cursor, last_run_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(scope_key) DO UPDATE SET
         last_cursor = excluded.last_cursor,
         last_run_id = excluded.last_run_id,
         updated_at = excluded.updated_at`,
      [key, tier, scope.ownerId, scope.workspaceId ?? null, cursor, runId ?? null, now],
    );
  }

  async getSyncStatus(scope: MemoryScope): Promise<GlobalSyncStatus> {
    const prefix = `${scopeKey(scope)}:`;
    const rows = await this.sql.query<SyncStateRow>(
      `SELECT scope_key, tier, owner_id, workspace_id, last_cursor, last_run_id, updated_at
       FROM intelligence_sync_state
       WHERE owner_id = ? AND (workspace_id IS ? OR workspace_id = ?)`,
      [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null],
    );

    const tiers: GlobalSyncStatus['tiers'] = {};
    for (const row of rows) {
      if (!row.scope_key.startsWith(prefix)) continue;
      tiers[row.tier as keyof GlobalSyncStatus['tiers']] = {
        lastCursor: row.last_cursor ?? undefined,
        lastSyncAt: row.updated_at,
      };
    }
    return { tiers };
  }

  async countAllTelemetry(): Promise<number> {
    const rows = await this.sql.query<{ count: number }>(
      `SELECT COUNT(*) AS count FROM intelligence_telemetry_events`,
    );
    return Number(rows[0]?.count ?? 0);
  }
}

export class NoOpIntelligenceStore implements IIntelligenceStore {
  async persistTelemetry(): Promise<void> {
    return undefined;
  }

  async countTelemetry(): Promise<number> {
    return 0;
  }

  async countTelemetryByType(): Promise<number> {
    return 0;
  }

  async setSyncCursor(): Promise<void> {
    return undefined;
  }

  async getSyncStatus(): Promise<GlobalSyncStatus> {
    return { tiers: {} };
  }
}
