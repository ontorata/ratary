import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  ClaimResult,
  IWriteIntentStore,
  WriteIntent,
  WriteIntentOperation,
  WriteIntentStatus,
} from '../../ports/write-intents/iwrite-intent-store.port.js';

interface WriteIntentRow {
  owner_id: string;
  request_id: string;
  operation: string;
  resource_type: string;
  resource_id: string;
  status: string;
  created_at: string;
}

/** SQLite: "UNIQUE constraint failed" · Postgres: "duplicate key value violates unique constraint". */
function isKeyViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique|duplicate key/i.test(message);
}

export class SqlWriteIntentStore implements IWriteIntentStore {
  constructor(private readonly db: ISqlDatabase) {}

  async claim(intent: Omit<WriteIntent, 'status' | 'createdAt'>): Promise<ClaimResult> {
    try {
      await this.db.execute(
        `INSERT INTO memory_write_intents (
          owner_id, request_id, operation, resource_type, resource_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'claimed', ?)`,
        [
          intent.ownerId,
          intent.requestId,
          intent.operation,
          intent.resourceType,
          intent.resourceId,
          new Date().toISOString(),
        ],
      );
      return { claimed: true };
    } catch (error) {
      if (!isKeyViolation(error)) throw error;
      const existing = await this.getByRequestId(intent.ownerId, intent.requestId);
      if (!existing) {
        // Key violation but no row — only possible if the winner's row was
        // deleted between our INSERT and SELECT. Surface as-is; the caller's
        // retry starts a fresh claim.
        throw error;
      }
      return { claimed: false, existing };
    }
  }

  async getByRequestId(ownerId: string, requestId: string): Promise<WriteIntent | null> {
    const rows = await this.db.query<WriteIntentRow>(
      `SELECT owner_id, request_id, operation, resource_type, resource_id, status, created_at
       FROM memory_write_intents
       WHERE owner_id = ? AND request_id = ?`,
      [ownerId, requestId],
    );
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async markCompleted(ownerId: string, requestId: string): Promise<void> {
    await this.db.execute(
      `UPDATE memory_write_intents SET status = 'completed'
       WHERE owner_id = ? AND request_id = ?`,
      [ownerId, requestId],
    );
  }

  async deleteExpiredCompleted(ownerId: string, olderThanIso: string): Promise<number> {
    const result = await this.db.execute(
      `DELETE FROM memory_write_intents
       WHERE owner_id = ? AND status = 'completed' AND created_at < ?`,
      [ownerId, olderThanIso],
    );
    return result.meta?.changes ?? 0;
  }

  async countExpiredCompleted(ownerId: string, olderThanIso: string): Promise<number> {
    const rows = await this.db.query<{ n: number }>(
      `SELECT COUNT(*) as n FROM memory_write_intents
       WHERE owner_id = ? AND status = 'completed' AND created_at < ?`,
      [ownerId, olderThanIso],
    );
    return rows[0]?.n ?? 0;
  }

  async listExpiredClaimed(ownerId: string, olderThanIso: string): Promise<WriteIntent[]> {
    const rows = await this.db.query<WriteIntentRow>(
      `SELECT owner_id, request_id, operation, resource_type, resource_id, status, created_at
       FROM memory_write_intents
       WHERE owner_id = ? AND status = 'claimed' AND created_at < ?`,
      [ownerId, olderThanIso],
    );
    return rows.map(mapRow);
  }

  async deleteByRequestId(ownerId: string, requestId: string): Promise<void> {
    await this.db.execute(
      `DELETE FROM memory_write_intents WHERE owner_id = ? AND request_id = ?`,
      [ownerId, requestId],
    );
  }
}

function mapRow(row: WriteIntentRow): WriteIntent {
  return {
    ownerId: row.owner_id,
    requestId: row.request_id,
    operation: row.operation as WriteIntentOperation,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    status: row.status as WriteIntentStatus,
    createdAt: row.created_at,
  };
}
