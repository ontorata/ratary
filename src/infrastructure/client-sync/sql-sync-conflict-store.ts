import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { SyncConflictRecord, SyncConflictStatus } from '../../client-sync/client-sync.types.js';
import type {
  ISyncConflictStore,
  SyncConflictInsert,
} from '../../client-sync/isync-conflict-store.port.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';

interface SyncConflictRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  platform_id: string;
  memory_id: string;
  payload: string;
  status: SyncConflictStatus;
  created_at: string;
}

export class SqlSyncConflictStore implements ISyncConflictStore {
  constructor(private readonly db: ISqlDatabase) {}

  async insert(record: SyncConflictInsert): Promise<SyncConflictRecord> {
    const id = generateId();
    const createdAt = nowISO();
    await this.db.execute(
      `INSERT INTO sync_conflicts (id, owner_id, workspace_id, platform_id, memory_id, payload, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        id,
        record.ownerId,
        record.workspaceId ?? null,
        record.platformId.toLowerCase(),
        record.memoryId,
        record.payload,
        createdAt,
      ],
    );
    return {
      id,
      ownerId: record.ownerId,
      workspaceId: record.workspaceId,
      platformId: record.platformId.toLowerCase(),
      memoryId: record.memoryId,
      payload: record.payload,
      status: 'pending',
      createdAt,
    };
  }

  async countPending(filters: {
    ownerId: string;
    workspaceId?: string;
    platformId?: string;
  }): Promise<number> {
    const { sql, params } = this.pendingFilter(filters);
    const rows = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_conflicts WHERE ${sql}`,
      params,
    );
    return rows[0]?.count ?? 0;
  }

  async listPending(filters: {
    ownerId: string;
    workspaceId?: string;
    platformId?: string;
    limit: number;
  }): Promise<SyncConflictRecord[]> {
    const { sql, params } = this.pendingFilter(filters);
    params.push(filters.limit);
    const rows = await this.db.query<SyncConflictRow>(
      `SELECT id, owner_id, workspace_id, platform_id, memory_id, payload, status, created_at
       FROM sync_conflicts WHERE ${sql}
       ORDER BY created_at ASC LIMIT ?`,
      params,
    );
    return rows.map((row) => this.toRecord(row));
  }

  async updateStatus(id: string, ownerId: string, status: SyncConflictStatus): Promise<void> {
    await this.db.execute(
      `UPDATE sync_conflicts SET status = ? WHERE id = ? AND owner_id = ?`,
      [status, id, ownerId],
    );
  }

  private pendingFilter(filters: {
    ownerId: string;
    workspaceId?: string;
    platformId?: string;
  }): { sql: string; params: unknown[] } {
    const conditions = ['owner_id = ?', "status = 'pending'"];
    const params: unknown[] = [filters.ownerId];
    const workspaceId = filters.workspaceId ?? null;

    conditions.push('((workspace_id IS NULL AND ? IS NULL) OR workspace_id = ?)');
    params.push(workspaceId, workspaceId);

    if (filters.platformId) {
      conditions.push('platform_id = ?');
      params.push(filters.platformId.toLowerCase());
    }

    return { sql: conditions.join(' AND '), params };
  }

  private toRecord(row: SyncConflictRow): SyncConflictRecord {
    return {
      id: row.id,
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? undefined,
      platformId: row.platform_id,
      memoryId: row.memory_id,
      payload: row.payload,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
