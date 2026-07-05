import { describe, expect, it } from 'vitest';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';
import { PgVectorStoreAdapter } from '../../src/infrastructure/vector/pgvector/pgvector-store.adapter.js';
import { PGVECTOR_MEMORY_VECTORS_DDL } from '../../src/infrastructure/vector/pgvector/pgvector.schema.js';
import { describeVectorStoreContract } from './contracts/ivector-store.contract.js';
import { cosineSimilarity } from '../../src/embedding/cosine-similarity.js';

interface StoredRow {
  id: string;
  memory_id: string;
  owner_id: string;
  workspace_id: string | null;
  model_id: string;
  dimensions: number;
  embedding: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

class InMemoryPgVectorDatabase implements ISqlDatabase {
  private rows = new Map<string, StoredRow>();

  async query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    if (sql.includes('FROM memory_vectors') && sql.includes('memory_id = ?')) {
      const [memoryId, ownerId, modelId] = params ?? [];
      const row = [...this.rows.values()].find(
        (candidate) =>
          candidate.memory_id === memoryId &&
          candidate.owner_id === ownerId &&
          candidate.model_id === modelId,
      );
      return (row ? [row] : []) as T[];
    }

    if (sql.includes('1 - (embedding <=>')) {
      const [literal, ownerId, , limit] = params ?? [];
      const queryVector = JSON.parse(String(literal)) as number[];
      const scored = [...this.rows.values()]
        .filter((row) => row.owner_id === ownerId)
        .map((row) => {
          const vector = JSON.parse(row.embedding) as number[];
          return {
            memory_id: row.memory_id,
            id: row.id,
            score: cosineSimilarity(queryVector, vector),
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, Number(limit));

      return scored as T[];
    }

    return [];
  }

  async execute(sql: string, params?: readonly unknown[]): Promise<SqlExecuteResult> {
    if (sql.startsWith('INSERT INTO memory_vectors')) {
      const [
        id,
        memoryId,
        ownerId,
        workspaceId,
        modelId,
        dimensions,
        literal,
        contentHash,
        createdAt,
        updatedAt,
      ] = params ?? [];
      this.rows.set(String(id), {
        id: String(id),
        memory_id: String(memoryId),
        owner_id: String(ownerId),
        workspace_id: workspaceId == null ? null : String(workspaceId),
        model_id: String(modelId),
        dimensions: Number(dimensions),
        embedding: String(literal),
        content_hash: String(contentHash),
        created_at: String(createdAt),
        updated_at: String(updatedAt),
      });
      return { results: [], meta: { changes: 1 } };
    }

    if (sql.startsWith('UPDATE memory_vectors')) {
      const [dimensions, literal, contentHash, workspaceId, updatedAt, id, ownerId] = params ?? [];
      const row = this.rows.get(String(id));
      if (row && row.owner_id === ownerId) {
        row.dimensions = Number(dimensions);
        row.embedding = String(literal);
        row.content_hash = String(contentHash);
        row.workspace_id = workspaceId == null ? null : String(workspaceId);
        row.updated_at = String(updatedAt);
      }
      return { results: [], meta: { changes: 1 } };
    }

    if (sql.startsWith('DELETE FROM memory_vectors WHERE memory_id')) {
      const [memoryId, ownerId] = params ?? [];
      for (const [key, row] of this.rows) {
        if (row.memory_id === memoryId && row.owner_id === ownerId) {
          this.rows.delete(key);
        }
      }
      return { results: [], meta: { changes: 1 } };
    }

    if (sql.startsWith('DELETE FROM memory_vectors WHERE owner_id')) {
      const [ownerId] = params ?? [];
      for (const [key, row] of this.rows) {
        if (row.owner_id === ownerId) {
          this.rows.delete(key);
        }
      }
      return { results: [], meta: { changes: 1 } };
    }

    return { results: [], meta: { changes: 0 } };
  }
}

describe('PgVectorStoreAdapter', () => {
  describeVectorStoreContract('pgvector in-memory', () => {
    return new PgVectorStoreAdapter(new InMemoryPgVectorDatabase());
  });

  it('should expose memory_vectors DDL for ops migration', () => {
    expect(PGVECTOR_MEMORY_VECTORS_DDL).toContain('memory_vectors');
    expect(PGVECTOR_MEMORY_VECTORS_DDL).toContain('embedding vector');
  });

  it('should reject vector length mismatch', async () => {
    const store = new PgVectorStoreAdapter(new InMemoryPgVectorDatabase());
    await expect(
      store.upsert({
        memoryId: 'mem-bad',
        scope: { ownerId: 'owner-a' },
        modelId: 'noop',
        dimensions: 3,
        vector: [1, 0],
        contentHash: 'hash',
      }),
    ).rejects.toThrow(/does not match dimensions/);
  });
});
