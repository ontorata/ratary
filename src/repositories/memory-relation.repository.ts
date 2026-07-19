import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type {
  CreateRelationInput,
  MemoryRelation,
  RelationType,
  SourceType,
} from '../types/knowledge.js';
import type { IMemoryRelationRepository } from './memory-relation.repository.interface.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import { DatabaseError } from '../types/errors.js';

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

const RELATION_SELECT = `id, source_memory_id, target_memory_id, relation, owner_id,
  weight, confidence, created_by, source_type, metadata, created_at`;

const RELATION_SELECT_QUALIFIED = RELATION_SELECT.split(', ')
  .map((column) => `r.${column}`)
  .join(', ');

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

export class MemoryRelationRepository implements IMemoryRelationRepository {
  constructor(private readonly db: ISqlDatabase) {}

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
      throw new DatabaseError('Failed to retrieve inserted relation');
    }
    return relation;
  }

  async findById(id: string, ownerId: string): Promise<MemoryRelation | null> {
    const rows = await this.db.query<RelationRow>(
      `SELECT ${RELATION_SELECT} FROM memory_relations WHERE id = ? AND owner_id = ?`,
      [id, ownerId],
    );
    if (rows.length === 0) return null;
    return rowToRelation(rows[0]);
  }

  async findByMemoryId(
    memoryId: string,
    ownerId: string,
    workspaceId?: string,
  ): Promise<MemoryRelation[]> {
    if (workspaceId) {
      const rows = await this.db.query<RelationRow>(
        `SELECT ${RELATION_SELECT_QUALIFIED} FROM memory_relations r
         INNER JOIN memories sm ON sm.id = r.source_memory_id AND sm.owner_id = r.owner_id
         INNER JOIN memories tm ON tm.id = r.target_memory_id AND tm.owner_id = r.owner_id
         WHERE r.owner_id = ? AND (r.source_memory_id = ? OR r.target_memory_id = ?)
           AND sm.workspace_id = ? AND tm.workspace_id = ?
         ORDER BY r.created_at DESC`,
        [ownerId, memoryId, memoryId, workspaceId, workspaceId],
      );
      return rows.map(rowToRelation);
    }

    const rows = await this.db.query<RelationRow>(
      `SELECT ${RELATION_SELECT} FROM memory_relations
       WHERE owner_id = ? AND (source_memory_id = ? OR target_memory_id = ?)
       ORDER BY created_at DESC`,
      [ownerId, memoryId, memoryId],
    );
    return rows.map(rowToRelation);
  }

  async countDegreeByOwner(ownerId: string): Promise<Map<string, number>> {
    const rows = await this.db.query<{ memory_id: string; degree: number }>(
      `SELECT memory_id, COUNT(*) as degree FROM (
         SELECT source_memory_id AS memory_id FROM memory_relations WHERE owner_id = ?
         UNION ALL
         SELECT target_memory_id AS memory_id FROM memory_relations WHERE owner_id = ?
       ) GROUP BY memory_id`,
      [ownerId, ownerId],
    );
    return new Map(rows.map((row) => [row.memory_id, Number(row.degree)]));
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

  async upsertInferred(data: {
    sourceMemoryId: string;
    targetMemoryId: string;
    relation: RelationType;
    ownerId: string;
    weight: number;
    confidence: number;
    metadata?: Record<string, unknown>;
  }): Promise<'created' | 'updated' | 'skipped_manual'> {
    const rows = await this.db.query<RelationRow>(
      `SELECT ${RELATION_SELECT} FROM memory_relations
       WHERE owner_id = ? AND source_memory_id = ? AND target_memory_id = ? AND relation = ?`,
      [data.ownerId, data.sourceMemoryId, data.targetMemoryId, data.relation],
    );

    if (rows.length > 0) {
      const existing = rowToRelation(rows[0]);
      if (existing.sourceType !== 'inferred') {
        return 'skipped_manual';
      }

      await this.db.execute(
        `UPDATE memory_relations
         SET weight = ?, confidence = ?, metadata = ?
         WHERE id = ? AND owner_id = ?`,
        [
          data.weight,
          data.confidence,
          JSON.stringify(data.metadata ?? {}),
          existing.id,
          data.ownerId,
        ],
      );
      return 'updated';
    }

    await this.insert({
      ...data,
      sourceType: 'inferred',
      createdBy: null,
    });
    return 'created';
  }
}
