import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IMemorySignalStore } from '../../ports/signals/imemory-signal-store.port.js';
import type { MemoryQualitySignal } from '../../ingest/memory-quality-signal.types.js';

export class SqlMemorySignalStore implements IMemorySignalStore {
  constructor(private readonly db: ISqlDatabase) {}

  async exists(signalId: string): Promise<boolean> {
    const rows = await this.db.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM memory_signals WHERE id = ?',
      [signalId],
    );
    return (rows[0]?.count ?? 0) > 0;
  }

  async append(signal: MemoryQualitySignal): Promise<void> {
    await this.db.execute(
      `INSERT INTO memory_signals (
        id, owner_id, workspace_id, memory_id, signal_type, payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        signal.signalId,
        signal.ownerId,
        signal.workspaceId ?? null,
        signal.memoryId ?? null,
        signal.signalType,
        JSON.stringify(signal.payload ?? {}),
        signal.observedAt,
      ],
    );
  }

  async listByScope(
    scope: { ownerId: string; workspaceId?: string },
    limit = 500,
  ): Promise<MemoryQualitySignal[]> {
    const conditions = ['owner_id = ?'];
    const params: unknown[] = [scope.ownerId];
    if (scope.workspaceId) {
      conditions.push('workspace_id = ?');
      params.push(scope.workspaceId);
    }
    params.push(limit);

    const rows = await this.db.query<{
      id: string;
      owner_id: string;
      workspace_id: string | null;
      memory_id: string | null;
      signal_type: string;
      payload: string;
      created_at: string;
    }>(
      `SELECT id, owner_id, workspace_id, memory_id, signal_type, payload, created_at
       FROM memory_signals
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT ?`,
      params,
    );

    return rows.map((row) => ({
      signalId: row.id,
      signalType: row.signal_type as MemoryQualitySignal['signalType'],
      memoryId: row.memory_id ?? undefined,
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      payload: parsePayload(row.payload),
      observedAt: row.created_at,
    }));
  }
}

function parsePayload(raw: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}
