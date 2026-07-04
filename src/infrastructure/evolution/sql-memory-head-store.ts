import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IMemoryHeadStore } from '../../evolution/imemory-head-store.port.js';
import type { MemoryHeadRecord } from '../../evolution/memory-evolution.types.js';
import { EVOLUTION_DEFAULT_BRANCH } from '../../evolution/memory-evolution.constants.js';
import { nowISO } from '../../utils/memory-mapper.js';

export class SqlMemoryHeadStore implements IMemoryHeadStore {
  constructor(private readonly db: ISqlDatabase) {}

  async initHead(memoryId: string, ownerId: string): Promise<MemoryHeadRecord> {
    const now = nowISO();
    await this.db.execute(
      `INSERT INTO memory_heads (memory_id, owner_id, current_version, branch_name, updated_at)
       VALUES (?, ?, 0, ?, ?)
       ON CONFLICT(memory_id) DO NOTHING`,
      [memoryId, ownerId, EVOLUTION_DEFAULT_BRANCH, now],
    );

    const head = await this.getHead(memoryId, ownerId);
    if (!head) {
      throw new Error('Failed to initialize memory head');
    }
    return head;
  }

  async getHead(memoryId: string, ownerId: string): Promise<MemoryHeadRecord | null> {
    const rows = await this.db.query<{
      memory_id: string;
      owner_id: string;
      current_version: number;
      branch_name: string;
      updated_at: string;
    }>(
      `SELECT memory_id, owner_id, current_version, branch_name, updated_at
       FROM memory_heads WHERE memory_id = ? AND owner_id = ?`,
      [memoryId, ownerId],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      memoryId: row.memory_id,
      ownerId: row.owner_id,
      currentVersion: row.current_version,
      branchName: row.branch_name,
      updatedAt: row.updated_at,
    };
  }

  async incrementHead(memoryId: string, ownerId: string): Promise<MemoryHeadRecord> {
    const now = nowISO();
    await this.db.execute(
      `UPDATE memory_heads
       SET current_version = current_version + 1, updated_at = ?
       WHERE memory_id = ? AND owner_id = ?`,
      [now, memoryId, ownerId],
    );

    const head = await this.getHead(memoryId, ownerId);
    if (!head) {
      throw new Error('Memory head not found');
    }
    return head;
  }
}
