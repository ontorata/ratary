import type { D1Client } from '../db/d1-client.js';
import type {
  CreateRelationInput,
  MemoryRelation,
  RelationType,
  SourceType,
} from '../types/knowledge.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';

interface RelationRow {
  id: string;
  source_memory_id: string;
  target_memory_id: string;
  relation: string;
  owner_id: string;
  weight: number;
  confidence: number;
  created_by: string | null;
  source_type: string;
  metadata: string;
  created_at: string;
}

function rowToRelation(row: RelationRow): MemoryRelation {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    metadata = {};
  }

  return {
    id: row.id,
    sourceMemoryId: row.source_memory_id,
    targetMemoryId: row.target_memory_id,
    relation: row.relation as RelationType,
    ownerId: row.owner_id,
    weight: row.weight,
    confidence: row.confidence,
    createdBy: row.created_by,
    sourceType: row.source_type as SourceType,
    metadata,
    createdAt: row.created_at,
  };
}

export class MemoryRelationRepository {
  constructor(private readonly db: D1Client) {}

  async insert(data: {
    sourceMemoryId: string;
    targetMemoryId: string;
    relation: RelationType;
    ownerId: string;
    weight?: number;
    confidence?: number;
    createdBy?: string | null;
    sourceType?: SourceType;
    metadata?: Record<string, unknown>;
  }): Promise<MemoryRelation> {
    const id = generateId();
    const now = nowISO();

    await this.db.execute(
      `INSERT INTO memory_relations (
        id, source_memory_id, target_memory_id, relation, owner_id,
        weight, confidence, created_by, source_type, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.sourceMemoryId,
        data.targetMemoryId,
        data.relation,
        data.ownerId,
        data.weight ?? 1.0,
        data.confidence ?? 1.0,
        data.createdBy ?? null,
        data.sourceType ?? 'manual',
        JSON.stringify(data.metadata ?? {}),
        now,
      ],
    );

    const relation = await this.findById(id, data.ownerId);
    if (!relation) {
      throw new Error('Failed to retrieve inserted relation');
    }
    return relation;
  }

  async findById(id: string, ownerId: string): Promise<MemoryRelation | null> {
    const rows = await this.db.query<RelationRow>(
      'SELECT * FROM memory_relations WHERE id = ? AND owner_id = ?',
      [id, ownerId],
    );
    if (rows.length === 0) return null;
    return rowToRelation(rows[0]);
  }

  async findByMemoryId(memoryId: string, ownerId: string): Promise<MemoryRelation[]> {
    const rows = await this.db.query<RelationRow>(
      `SELECT * FROM memory_relations
       WHERE owner_id = ? AND (source_memory_id = ? OR target_memory_id = ?)
       ORDER BY created_at DESC`,
      [ownerId, memoryId, memoryId],
    );
    return rows.map(rowToRelation);
  }

  async exists(
    sourceMemoryId: string,
    targetMemoryId: string,
    relation: RelationType,
    ownerId: string,
  ): Promise<boolean> {
    const rows = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM memory_relations
       WHERE owner_id = ? AND source_memory_id = ? AND target_memory_id = ? AND relation = ?`,
      [ownerId, sourceMemoryId, targetMemoryId, relation],
    );
    return (rows[0]?.count ?? 0) > 0;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const result = await this.db.execute(
      'DELETE FROM memory_relations WHERE id = ? AND owner_id = ?',
      [id, ownerId],
    );
    return (result.meta?.changes ?? 0) > 0;
  }

  async createFromInput(
    sourceMemoryId: string,
    ownerId: string,
    input: CreateRelationInput,
    createdBy?: string | null,
  ): Promise<MemoryRelation> {
    return this.insert({
      sourceMemoryId,
      targetMemoryId: input.targetMemoryId,
      relation: input.relation,
      ownerId,
      weight: input.weight,
      confidence: input.confidence,
      sourceType: input.sourceType,
      metadata: input.metadata,
      createdBy,
    });
  }
}
