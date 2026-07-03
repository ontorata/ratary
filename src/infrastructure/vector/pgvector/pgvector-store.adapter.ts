import { generateId, nowISO } from '../../../utils/memory-mapper.js';
import { ValidationError } from '../../../types/errors.js';
import type { ISqlDatabase } from '../../../ports/sql/isql-database.port.js';
import type {
  IVectorStore,
  StoredVector,
  VectorScopeKey,
  VectorSearchMatch,
  VectorUpsertInput,
} from '../../../ports/vector/ivector-store.port.js';

interface MemoryVectorRow {
  id: string;
  memory_id: string;
  owner_id: string;
  workspace_id: string | null;
  model_id: string;
  dimensions: number;
  embedding: string | number[];
  content_hash: string;
  created_at: string;
  updated_at: string;
}

interface SimilarityRow {
  memory_id: string;
  id: string;
  score: number;
}

function vectorLiteral(values: readonly number[]): string {
  return `[${values.join(',')}]`;
}

function parseVector(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map(Number);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      return JSON.parse(trimmed) as number[];
    }
  }
  throw new ValidationError('Unsupported pgvector embedding column value');
}

function rowToStoredVector(row: MemoryVectorRow, scope: VectorScopeKey): StoredVector {
  return {
    id: row.id,
    memoryId: row.memory_id,
    scope: {
      ownerId: row.owner_id,
      workspaceId: row.workspace_id ?? scope.workspaceId,
    },
    modelId: row.model_id,
    dimensions: row.dimensions,
    vector: parseVector(row.embedding),
    contentHash: row.content_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * PostgreSQL pgvector adapter implementing IVectorStore (ADR-011).
 * Uses cosine distance (<=>); score = 1 - distance to align with D1 cosine similarity.
 */
export class PgVectorStoreAdapter implements IVectorStore {
  constructor(private readonly db: ISqlDatabase) {}

  async upsert(input: VectorUpsertInput): Promise<string> {
    this.assertVectorDimensions(input.vector, input.dimensions);

    const existing = await this.findByMemoryId(input.memoryId, input.scope, input.modelId);
    const now = nowISO();
    const literal = vectorLiteral(input.vector);

    if (existing) {
      await this.db.execute(
        `UPDATE memory_vectors
         SET dimensions = ?, embedding = ?::vector, content_hash = ?, workspace_id = ?, updated_at = ?
         WHERE id = ? AND owner_id = ?`,
        [
          input.dimensions,
          literal,
          input.contentHash,
          input.scope.workspaceId ?? null,
          now,
          existing.id,
          input.scope.ownerId,
        ],
      );
      return existing.id;
    }

    const id = generateId();
    await this.db.execute(
      `INSERT INTO memory_vectors (
         id, memory_id, owner_id, workspace_id, model_id, dimensions, embedding, content_hash, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?::vector, ?, ?, ?)`,
      [
        id,
        input.memoryId,
        input.scope.ownerId,
        input.scope.workspaceId ?? null,
        input.modelId,
        input.dimensions,
        literal,
        input.contentHash,
        now,
        now,
      ],
    );

    return id;
  }

  async deleteByMemoryId(memoryId: string, scope: VectorScopeKey): Promise<void> {
    await this.db.execute(`DELETE FROM memory_vectors WHERE memory_id = ? AND owner_id = ?`, [
      memoryId,
      scope.ownerId,
    ]);
  }

  async deleteAllInScope(scope: VectorScopeKey): Promise<void> {
    await this.db.execute(`DELETE FROM memory_vectors WHERE owner_id = ?`, [scope.ownerId]);
  }

  async findByMemoryId(
    memoryId: string,
    scope: VectorScopeKey,
    modelId: string,
  ): Promise<StoredVector | null> {
    const rows = await this.db.query<MemoryVectorRow>(
      `SELECT id, memory_id, owner_id, workspace_id, model_id, dimensions, embedding, content_hash, created_at, updated_at
       FROM memory_vectors
       WHERE memory_id = ? AND owner_id = ? AND model_id = ?`,
      [memoryId, scope.ownerId, modelId],
    );

    const row = rows[0];
    return row ? rowToStoredVector(row, scope) : null;
  }

  async searchSimilar(
    queryVector: readonly number[],
    scope: VectorScopeKey,
    limit: number,
  ): Promise<VectorSearchMatch[]> {
    if (limit <= 0) {
      return [];
    }

    const literal = vectorLiteral(queryVector);
    const rows = await this.db.query<SimilarityRow>(
      `SELECT memory_id, id, 1 - (embedding <=> ?::vector) AS score
       FROM memory_vectors
       WHERE owner_id = ?
       ORDER BY embedding <=> ?::vector
       LIMIT ?`,
      [literal, scope.ownerId, literal, limit],
    );

    return rows.map((row) => ({
      memoryId: row.memory_id,
      vectorId: row.id,
      score: Number(row.score),
    }));
  }

  private assertVectorDimensions(vector: readonly number[], dimensions: number): void {
    if (vector.length !== dimensions) {
      throw new ValidationError(
        `Vector length ${vector.length} does not match dimensions ${dimensions}`,
      );
    }
  }
}
