import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IMemoryVersionStore } from '../../evolution/imemory-version-store.port.js';
import type { MemoryVersionRecord } from '../../evolution/memory-evolution.types.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';

export class SqlMemoryVersionStore implements IMemoryVersionStore {
  constructor(private readonly db: ISqlDatabase) {}

  async appendVersion(
    record: Omit<MemoryVersionRecord, 'id' | 'createdAt'>,
  ): Promise<MemoryVersionRecord> {
    const id = generateId();
    const createdAt = nowISO();

    await this.db.execute(
      `INSERT INTO memory_versions (
        id, memory_id, owner_id, version_number, snapshot, created_by,
        merge_parent_ids, confidence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.memoryId,
        record.ownerId,
        record.versionNumber,
        JSON.stringify(record.snapshot),
        record.createdBy,
        JSON.stringify(record.mergeParentIds),
        record.confidence,
        createdAt,
      ],
    );

    return { ...record, id, createdAt };
  }

  async listVersions(memoryId: string, ownerId: string): Promise<MemoryVersionRecord[]> {
    const rows = await this.db.query<{
      id: string;
      memory_id: string;
      owner_id: string;
      version_number: number;
      snapshot: string;
      created_by: string | null;
      merge_parent_ids: string;
      confidence: number;
      created_at: string;
    }>(
      `SELECT id, memory_id, owner_id, version_number, snapshot, created_by,
              merge_parent_ids, confidence, created_at
       FROM memory_versions
       WHERE memory_id = ? AND owner_id = ?
       ORDER BY version_number ASC`,
      [memoryId, ownerId],
    );

    return rows.map((row) => ({
      id: row.id,
      memoryId: row.memory_id,
      ownerId: row.owner_id,
      versionNumber: row.version_number,
      snapshot: JSON.parse(row.snapshot) as MemoryVersionRecord['snapshot'],
      createdBy: row.created_by,
      mergeParentIds: JSON.parse(row.merge_parent_ids) as string[],
      confidence: row.confidence,
      createdAt: row.created_at,
    }));
  }

  async getVersion(
    memoryId: string,
    ownerId: string,
    versionNumber: number,
  ): Promise<MemoryVersionRecord | null> {
    const rows = await this.db.query<{
      id: string;
      memory_id: string;
      owner_id: string;
      version_number: number;
      snapshot: string;
      created_by: string | null;
      merge_parent_ids: string;
      confidence: number;
      created_at: string;
    }>(
      `SELECT id, memory_id, owner_id, version_number, snapshot, created_by,
              merge_parent_ids, confidence, created_at
       FROM memory_versions
       WHERE memory_id = ? AND owner_id = ? AND version_number = ?`,
      [memoryId, ownerId, versionNumber],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      memoryId: row.memory_id,
      ownerId: row.owner_id,
      versionNumber: row.version_number,
      snapshot: JSON.parse(row.snapshot) as MemoryVersionRecord['snapshot'],
      createdBy: row.created_by,
      mergeParentIds: JSON.parse(row.merge_parent_ids) as string[],
      confidence: row.confidence,
      createdAt: row.created_at,
    };
  }
}
