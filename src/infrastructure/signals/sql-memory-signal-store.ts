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
}
