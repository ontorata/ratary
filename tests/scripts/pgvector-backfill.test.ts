import { describe, expect, it } from 'vitest';
import { parseBackfillArgs } from '../../scripts/lib/backfill-cli.js';
import {
  backfillPgvector,
  ensurePgvectorSchema,
  type PgvectorEmbeddingSourceRow,
} from '../../scripts/lib/pgvector-backfill.js';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';
import type {
  IVectorStore,
  StoredVector,
  VectorScopeKey,
  VectorUpsertInput,
} from '../../src/ports/vector/ivector-store.port.js';

describe('parseBackfillArgs', () => {
  it('should default to dry-run', () => {
    expect(parseBackfillArgs([]).dryRun).toBe(true);
  });

  it('should parse execute, owner, and batch size', () => {
    const cli = parseBackfillArgs(['--execute', '--owner=owner-a', '--batch-size=50']);
    expect(cli.dryRun).toBe(false);
    expect(cli.ownerId).toBe('owner-a');
    expect(cli.batchSize).toBe(50);
  });
});

class FakeSourceSql implements ISqlDatabase {
  constructor(private readonly rows: PgvectorEmbeddingSourceRow[]) {}

  async query<T>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    if (sql.includes('DISTINCT owner_id')) {
      return [{ owner_id: 'owner-a' }] as T[];
    }
    const ownerId = params?.[0];
    return this.rows.filter((row) => row.owner_id === ownerId) as T[];
  }

  async execute(): Promise<SqlExecuteResult> {
    return { results: [], meta: { changes: 0 } };
  }
}

class FakeVectorStore implements IVectorStore {
  readonly upserts: VectorUpsertInput[] = [];
  private readonly existing = new Map<string, StoredVector>();

  async upsert(input: VectorUpsertInput): Promise<string> {
    this.upserts.push(input);
    const id = `vec-${input.memoryId}`;
    this.existing.set(`${input.memoryId}:${input.modelId}`, {
      id,
      memoryId: input.memoryId,
      scope: input.scope,
      modelId: input.modelId,
      dimensions: input.dimensions,
      vector: [...input.vector],
      contentHash: input.contentHash,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    return id;
  }

  async deleteByMemoryId(): Promise<void> {}
  async deleteAllInScope(): Promise<void> {}

  async findByMemoryId(
    memoryId: string,
    scope: VectorScopeKey,
    modelId: string,
  ): Promise<StoredVector | null> {
    return this.existing.get(`${memoryId}:${modelId}`) ?? null;
  }

  async searchSimilar(): Promise<[]> {
    return [];
  }
}

describe('backfillPgvector', () => {
  it('should skip unchanged content_hash on execute', async () => {
    const rows: PgvectorEmbeddingSourceRow[] = [
      {
        id: 'emb-1',
        memory_id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-1',
        model_id: 'noop',
        dimensions: 3,
        vector_json: '[1,0,0]',
        content_hash: 'hash-a',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    const source = new FakeSourceSql(rows);
    const vectorStore = new FakeVectorStore();
    await vectorStore.upsert({
      memoryId: 'mem-1',
      scope: { ownerId: 'owner-a' },
      modelId: 'noop',
      dimensions: 3,
      vector: [1, 0, 0],
      contentHash: 'hash-a',
    });

    const result = await backfillPgvector({
      source,
      vectorStore,
      ownerId: 'owner-a',
      batchSize: 10,
      dryRun: false,
    });

    expect(result.scanned).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.upserted).toBe(0);
  });

  it('should report scanned rows on dry-run', async () => {
    const source = new FakeSourceSql([
      {
        id: 'emb-1',
        memory_id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: null,
        model_id: 'noop',
        dimensions: 3,
        vector_json: '[1,0,0]',
        content_hash: 'hash-a',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const vectorStore = new FakeVectorStore();

    const result = await backfillPgvector({
      source,
      vectorStore,
      ownerId: 'owner-a',
      batchSize: 10,
      dryRun: true,
    });

    expect(result.scanned).toBe(1);
    expect(result.upserted).toBe(1);
    expect(vectorStore.upserts).toHaveLength(0);
  });
});

describe('ensurePgvectorSchema', () => {
  it('should execute extension and table DDL', async () => {
    const executed: string[] = [];
    const target: ISqlDatabase = {
      query: async () => [],
      execute: async (sql) => {
        executed.push(sql);
        return { results: [], meta: { changes: 0 } };
      },
    };

    await ensurePgvectorSchema(target);
    expect(executed.some((sql) => sql.includes('CREATE EXTENSION'))).toBe(true);
    expect(executed.some((sql) => sql.includes('memory_vectors'))).toBe(true);
  });
});
