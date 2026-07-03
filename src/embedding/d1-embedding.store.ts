import type { D1Client } from '../db/d1-client.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import { cosineSimilarity } from './cosine-similarity.js';
import type {
  EmbeddingUpsertInput,
  IEmbeddingStore,
  SimilarityMatch,
  StoredEmbedding,
} from './embedding.store.interface.js';
import { ValidationError } from '../types/errors.js';

interface EmbeddingRow {
  id: string;
  memory_id: string;
  owner_id: string;
  model_id: string;
  dimensions: number;
  vector_json: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

function rowToStoredEmbedding(row: EmbeddingRow): StoredEmbedding {
  return {
    id: row.id,
    memoryId: row.memory_id,
    ownerId: row.owner_id,
    modelId: row.model_id,
    dimensions: row.dimensions,
    vector: JSON.parse(row.vector_json) as number[],
    contentHash: row.content_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class D1EmbeddingStore implements IEmbeddingStore {
  constructor(private readonly db: D1Client) {}

  async upsert(input: EmbeddingUpsertInput): Promise<string> {
    this.assertVectorDimensions(input.vector, input.dimensions);

    const existing = await this.findByMemoryId(input.memoryId, input.ownerId, input.modelId);
    const now = nowISO();
    const vectorJson = JSON.stringify(input.vector);

    if (existing) {
      await this.db.execute(
        `UPDATE memory_embeddings
         SET dimensions = ?, vector_json = ?, content_hash = ?, updated_at = ?
         WHERE id = ? AND owner_id = ?`,
        [input.dimensions, vectorJson, input.contentHash, now, existing.id, input.ownerId],
      );
      return existing.id;
    }

    const id = generateId();
    await this.db.execute(
      `INSERT INTO memory_embeddings (
         id, memory_id, owner_id, model_id, dimensions, vector_json, content_hash, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.memoryId,
        input.ownerId,
        input.modelId,
        input.dimensions,
        vectorJson,
        input.contentHash,
        now,
        now,
      ],
    );

    return id;
  }

  async deleteByMemoryId(memoryId: string, ownerId: string): Promise<void> {
    await this.db.execute(`DELETE FROM memory_embeddings WHERE memory_id = ? AND owner_id = ?`, [
      memoryId,
      ownerId,
    ]);
  }

  async deleteAllByOwner(ownerId: string): Promise<void> {
    await this.db.execute(`DELETE FROM memory_embeddings WHERE owner_id = ?`, [ownerId]);
  }

  async findByMemoryId(
    memoryId: string,
    ownerId: string,
    modelId: string,
  ): Promise<StoredEmbedding | null> {
    const rows = await this.db.query<EmbeddingRow>(
      `SELECT id, memory_id, owner_id, model_id, dimensions, vector_json, content_hash, created_at, updated_at
       FROM memory_embeddings
       WHERE memory_id = ? AND owner_id = ? AND model_id = ?`,
      [memoryId, ownerId, modelId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return rowToStoredEmbedding(row);
  }

  async searchSimilar(
    queryVector: number[],
    ownerId: string,
    limit: number,
  ): Promise<SimilarityMatch[]> {
    if (limit <= 0) {
      return [];
    }

    const rows = await this.db.query<EmbeddingRow>(
      `SELECT id, memory_id, owner_id, model_id, dimensions, vector_json, content_hash, created_at, updated_at
       FROM memory_embeddings
       WHERE owner_id = ?`,
      [ownerId],
    );

    const matches: SimilarityMatch[] = [];

    for (const row of rows) {
      const vector = JSON.parse(row.vector_json) as number[];
      if (vector.length !== queryVector.length) {
        continue;
      }

      matches.push({
        memoryId: row.memory_id,
        embeddingId: row.id,
        score: cosineSimilarity(queryVector, vector),
      });
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private assertVectorDimensions(vector: number[], dimensions: number): void {
    if (vector.length !== dimensions) {
      throw new ValidationError(`Vector length ${vector.length} does not match dimensions ${dimensions}`);
    }
  }
}
