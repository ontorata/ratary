/**
 * Phase 35 — SQL adapter for entity mention edges (ADR-068 D1/D5).
 *
 * Idempotent on (owner_id, memory_id, entity_id, field); reads are
 * deterministically ordered (confidence DESC, memory_id ASC) so retrieval
 * candidates replay byte-identically (ADR-0006).
 */
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  IEntityMentionStore,
  UpsertEntityMentionInput,
} from '../../ports/entities/ientity-mention-store.port.js';
import type { EntityMention } from '../../types/entities.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';

interface MentionRow {
  id: string;
  owner_id: string;
  memory_id: string;
  entity_id: string;
  field: string;
  confidence: number;
  evidence: string;
  source_type: string;
  created_at: string;
}

const MENTION_COLUMNS =
  'id, owner_id, memory_id, entity_id, field, confidence, evidence, source_type, created_at';

function toMention(row: MentionRow): EntityMention {
  return {
    id: row.id,
    ownerId: row.owner_id,
    memoryId: row.memory_id,
    entityId: row.entity_id,
    field: row.field as EntityMention['field'],
    confidence: row.confidence,
    evidence: JSON.parse(row.evidence) as EntityMention['evidence'],
    sourceType: row.source_type,
    createdAt: row.created_at,
  };
}

export class SqlEntityMentionStore implements IEntityMentionStore {
  constructor(private readonly db: ISqlDatabase) {}

  async upsert(mention: UpsertEntityMentionInput): Promise<boolean> {
    const result = await this.db.execute(
      `INSERT INTO entity_mentions (${MENTION_COLUMNS})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(owner_id, memory_id, entity_id, field) DO NOTHING`,
      [
        generateId(),
        mention.ownerId,
        mention.memoryId,
        mention.entityId,
        mention.field,
        mention.confidence,
        JSON.stringify(mention.evidence),
        mention.sourceType,
        nowISO(),
      ],
    );
    return (result.meta?.changes ?? 0) > 0;
  }

  async findByEntityIds(ownerId: string, entityIds: readonly string[]): Promise<EntityMention[]> {
    if (entityIds.length === 0) {
      return [];
    }
    const placeholders = entityIds.map(() => '?').join(', ');
    const rows = await this.db.query<MentionRow>(
      `SELECT ${MENTION_COLUMNS} FROM entity_mentions
       WHERE owner_id = ? AND entity_id IN (${placeholders})
       ORDER BY confidence DESC, memory_id ASC, field ASC`,
      [ownerId, ...entityIds],
    );
    return rows.map(toMention);
  }

  async findByMemoryId(ownerId: string, memoryId: string): Promise<EntityMention[]> {
    const rows = await this.db.query<MentionRow>(
      `SELECT ${MENTION_COLUMNS} FROM entity_mentions
       WHERE owner_id = ? AND memory_id = ?
       ORDER BY entity_id ASC, field ASC`,
      [ownerId, memoryId],
    );
    return rows.map(toMention);
  }

  async countByOwner(ownerId: string): Promise<number> {
    const rows = await this.db.query<{ total: number }>(
      'SELECT COUNT(*) AS total FROM entity_mentions WHERE owner_id = ?',
      [ownerId],
    );
    return rows[0]?.total ?? 0;
  }
}
