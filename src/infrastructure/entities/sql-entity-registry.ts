/**
 * Phase 35 — SQL adapter for the canonical entity registry (ADR-068 D2).
 *
 * Invariant I1: `updateMetadata` never touches `id` — the UPDATE statement
 * has no way to re-key, so mentions stay valid across renames.
 */
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  CreateEntityInput,
  IEntityRegistry,
  UpdateEntityMetadataInput,
} from '../../ports/entities/ientity-registry.port.js';
import type { CanonicalEntity, EntityAlias, EntityKind } from '../../types/entities.js';
import { normalizeSymbol } from '../../knowledge/entities/normalize.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';

interface EntityRow {
  id: string;
  owner_id: string;
  canonical_name: string;
  normalized_name: string;
  kind: string;
  confidence: number;
  source_type: string;
  created_at: string;
  updated_at: string;
}

interface AliasRow {
  id: string;
  owner_id: string;
  entity_id: string;
  alias: string;
  normalized_alias: string;
  source_type: string;
  created_at: string;
}

const ENTITY_COLUMNS =
  'id, owner_id, canonical_name, normalized_name, kind, confidence, source_type, created_at, updated_at';

function toEntity(row: EntityRow): CanonicalEntity {
  return {
    id: row.id,
    ownerId: row.owner_id,
    canonicalName: row.canonical_name,
    normalizedName: row.normalized_name,
    kind: row.kind as CanonicalEntity['kind'],
    confidence: row.confidence,
    sourceType: row.source_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAlias(row: AliasRow): EntityAlias {
  return {
    id: row.id,
    ownerId: row.owner_id,
    entityId: row.entity_id,
    alias: row.alias,
    normalizedAlias: row.normalized_alias,
    sourceType: row.source_type,
    createdAt: row.created_at,
  };
}

export class SqlEntityRegistry implements IEntityRegistry {
  constructor(private readonly db: ISqlDatabase) {}

  async create(input: CreateEntityInput): Promise<CanonicalEntity> {
    const normalizedName = normalizeSymbol(input.canonicalName);
    const existing = await this.findByNormalizedName(input.ownerId, normalizedName, input.kind);
    if (existing) {
      return existing;
    }

    const now = nowISO();
    await this.db.execute(
      `INSERT INTO canonical_entities (${ENTITY_COLUMNS})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(owner_id, normalized_name, kind) DO NOTHING`,
      [
        generateId(),
        input.ownerId,
        input.canonicalName,
        normalizedName,
        input.kind,
        input.confidence ?? 1,
        input.sourceType ?? 'inferred',
        now,
        now,
      ],
    );

    const created = await this.findByNormalizedName(input.ownerId, normalizedName, input.kind);
    if (!created) {
      throw new Error(`entity registry: create failed for "${input.canonicalName}"`);
    }
    return created;
  }

  async findById(ownerId: string, entityId: string): Promise<CanonicalEntity | null> {
    const rows = await this.db.query<EntityRow>(
      `SELECT ${ENTITY_COLUMNS} FROM canonical_entities WHERE owner_id = ? AND id = ?`,
      [ownerId, entityId],
    );
    return rows.length > 0 ? toEntity(rows[0]) : null;
  }

  async findByNormalizedName(
    ownerId: string,
    normalizedName: string,
    kind?: EntityKind,
  ): Promise<CanonicalEntity | null> {
    const rows = kind
      ? await this.db.query<EntityRow>(
          `SELECT ${ENTITY_COLUMNS} FROM canonical_entities
           WHERE owner_id = ? AND normalized_name = ? AND kind = ?`,
          [ownerId, normalizedName, kind],
        )
      : await this.db.query<EntityRow>(
          `SELECT ${ENTITY_COLUMNS} FROM canonical_entities
           WHERE owner_id = ? AND normalized_name = ?
           ORDER BY kind ASC LIMIT 1`,
          [ownerId, normalizedName],
        );
    return rows.length > 0 ? toEntity(rows[0]) : null;
  }

  async findByNormalizedAlias(
    ownerId: string,
    normalizedAlias: string,
  ): Promise<CanonicalEntity | null> {
    const rows = await this.db.query<EntityRow>(
      `SELECT e.id, e.owner_id, e.canonical_name, e.normalized_name, e.kind,
              e.confidence, e.source_type, e.created_at, e.updated_at
       FROM entity_aliases a
       JOIN canonical_entities e ON e.id = a.entity_id AND e.owner_id = a.owner_id
       WHERE a.owner_id = ? AND a.normalized_alias = ?`,
      [ownerId, normalizedAlias],
    );
    return rows.length > 0 ? toEntity(rows[0]) : null;
  }

  async addAlias(ownerId: string, entityId: string, alias: string): Promise<EntityAlias> {
    const normalizedAlias = normalizeSymbol(alias);
    await this.db.execute(
      `INSERT INTO entity_aliases (id, owner_id, entity_id, alias, normalized_alias, source_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(owner_id, normalized_alias) DO NOTHING`,
      [generateId(), ownerId, entityId, alias, normalizedAlias, 'inferred', nowISO()],
    );

    const rows = await this.db.query<AliasRow>(
      `SELECT id, owner_id, entity_id, alias, normalized_alias, source_type, created_at
       FROM entity_aliases WHERE owner_id = ? AND normalized_alias = ?`,
      [ownerId, normalizedAlias],
    );
    if (rows.length === 0) {
      throw new Error(`entity registry: addAlias failed for "${alias}"`);
    }
    return toAlias(rows[0]);
  }

  async listAliases(ownerId: string, entityId: string): Promise<EntityAlias[]> {
    const rows = await this.db.query<AliasRow>(
      `SELECT id, owner_id, entity_id, alias, normalized_alias, source_type, created_at
       FROM entity_aliases WHERE owner_id = ? AND entity_id = ?
       ORDER BY normalized_alias ASC`,
      [ownerId, entityId],
    );
    return rows.map(toAlias);
  }

  async updateMetadata(
    ownerId: string,
    entityId: string,
    patch: UpdateEntityMetadataInput,
  ): Promise<CanonicalEntity> {
    const current = await this.findById(ownerId, entityId);
    if (!current) {
      throw new Error(`entity registry: unknown entity "${entityId}"`);
    }

    const canonicalName = patch.canonicalName ?? current.canonicalName;
    const confidence = patch.confidence ?? current.confidence;

    // I1: id is never part of the SET clause — renames can never re-key.
    await this.db.execute(
      `UPDATE canonical_entities
       SET canonical_name = ?, normalized_name = ?, confidence = ?, updated_at = ?
       WHERE owner_id = ? AND id = ?`,
      [canonicalName, normalizeSymbol(canonicalName), confidence, nowISO(), ownerId, entityId],
    );

    const updated = await this.findById(ownerId, entityId);
    if (!updated) {
      throw new Error(`entity registry: entity "${entityId}" vanished during update`);
    }
    return updated;
  }

  async listByOwner(ownerId: string): Promise<CanonicalEntity[]> {
    const rows = await this.db.query<EntityRow>(
      `SELECT ${ENTITY_COLUMNS} FROM canonical_entities
       WHERE owner_id = ?
       ORDER BY normalized_name ASC, kind ASC`,
      [ownerId],
    );
    return rows.map(toEntity);
  }
}
