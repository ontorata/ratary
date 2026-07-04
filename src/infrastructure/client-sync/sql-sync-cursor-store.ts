import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { SyncCursor } from '../../client-sync/client-sync.types.js';
import type { ISyncCursorStore, SyncCursorKey } from '../../client-sync/isync-cursor-store.port.js';

interface SyncCursorRow {
  owner_id: string;
  workspace_id: string | null;
  platform_id: string;
  cursor_value: string;
  updated_at: string;
}

export class SqlSyncCursorStore implements ISyncCursorStore {
  constructor(private readonly db: ISqlDatabase) {}

  async get(key: SyncCursorKey): Promise<SyncCursor | null> {
    const workspaceId = key.workspaceId ?? null;
    const rows = await this.db.query<SyncCursorRow>(
      `SELECT owner_id, workspace_id, platform_id, cursor_value, updated_at
       FROM sync_cursors
       WHERE owner_id = ? AND platform_id = ?
         AND ((workspace_id IS NULL AND ? IS NULL) OR workspace_id = ?)`,
      [key.ownerId, key.platformId.toLowerCase(), workspaceId, workspaceId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      platformId: row.platform_id,
      cursorValue: row.cursor_value,
      updatedAt: row.updated_at,
    };
  }

  async upsert(cursor: SyncCursor): Promise<void> {
    const workspaceId = cursor.workspaceId ?? null;
    const existing = await this.get({
      ownerId: cursor.ownerId,
      workspaceId: cursor.workspaceId,
      platformId: cursor.platformId,
    });

    if (existing) {
      await this.db.execute(
        `UPDATE sync_cursors SET cursor_value = ?, updated_at = ?
         WHERE owner_id = ? AND platform_id = ?
           AND ((workspace_id IS NULL AND ? IS NULL) OR workspace_id = ?)`,
        [
          cursor.cursorValue,
          cursor.updatedAt,
          cursor.ownerId,
          cursor.platformId.toLowerCase(),
          workspaceId,
          workspaceId,
        ],
      );
      return;
    }

    await this.db.execute(
      `INSERT INTO sync_cursors (id, owner_id, workspace_id, platform_id, cursor_value, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        cursor.ownerId,
        workspaceId,
        cursor.platformId.toLowerCase(),
        cursor.cursorValue,
        cursor.updatedAt ?? nowISO(),
      ],
    );
  }
}
