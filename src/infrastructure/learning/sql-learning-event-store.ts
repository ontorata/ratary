import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { ILearningEventStore } from '../../learning/ilearning-event-store.port.js';
import type { LearningEvent, LearningScope } from '../../learning/learning.types.js';

export class SqlLearningEventStore implements ILearningEventStore {
  constructor(private readonly db: ISqlDatabase) {}

  async append(event: Omit<LearningEvent, 'processed'>): Promise<void> {
    await this.db.execute(
      `INSERT INTO learning_events (
        id, owner_id, workspace_id, event_type, payload, processed, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        event.id,
        event.ownerId,
        event.workspaceId ?? null,
        event.eventType,
        JSON.stringify(event.payload),
        event.createdAt,
      ],
    );
  }

  async listUnprocessed(scope: LearningScope, limit: number): Promise<LearningEvent[]> {
    const rows = await this.db.query<{
      id: string;
      owner_id: string;
      workspace_id: string | null;
      event_type: string;
      payload: string;
      processed: number;
      created_at: string;
    }>(
      `SELECT id, owner_id, workspace_id, event_type, payload, processed, created_at
       FROM learning_events
       WHERE owner_id = ? AND processed = 0
         AND (workspace_id IS ? OR workspace_id = ?)
       ORDER BY created_at ASC
       LIMIT ?`,
      [scope.ownerId, scope.workspaceId ?? null, scope.workspaceId ?? null, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      eventType: row.event_type as LearningEvent['eventType'],
      payload: JSON.parse(row.payload) as Record<string, unknown>,
      processed: row.processed === 1,
      createdAt: row.created_at,
    }));
  }

  async markProcessed(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) {
      return;
    }
    const placeholders = eventIds.map(() => '?').join(', ');
    await this.db.execute(
      `UPDATE learning_events SET processed = 1 WHERE id IN (${placeholders})`,
      eventIds,
    );
  }
}
