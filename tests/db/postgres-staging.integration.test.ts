import pg from 'pg';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { createPostgresSqlDatabase } from '../../src/infrastructure/sql/postgres-sql-database.adapter.js';
import {
  applyPostgresSchema,
  applyPostgresSchemaToDatabase,
} from '../../scripts/lib/postgres-schema.js';

const stagingEnabled = process.env.POSTGRES_STAGING === '1' && Boolean(process.env.DATABASE_URL);

describe.skipIf(!stagingEnabled)('Postgres staging integration', () => {
  const connectionString = process.env.DATABASE_URL!;
  let pool: pg.Pool;

  beforeAll(async () => {
    await applyPostgresSchema(connectionString);
    pool = new pg.Pool({ connectionString });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should apply schema idempotently via applyPostgresSchemaToDatabase', async () => {
    const adapter = createPostgresSqlDatabase(connectionString);
    await expect(applyPostgresSchemaToDatabase(adapter)).resolves.toBeUndefined();
    const pgPool = adapter.unwrapPool();
    if (pgPool instanceof pg.Pool) {
      await pgPool.end();
    }
  });

  it('should have core metadata tables', async () => {
    const result = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('memories', 'organizations', 'memory_embeddings', 'workspaces')
       ORDER BY table_name`,
    );
    expect(result.rows.map((row) => row.table_name)).toEqual([
      'memories',
      'memory_embeddings',
      'organizations',
      'workspaces',
    ]);
  });

  it('should insert and scope reads via MemoryRepository on Postgres', async () => {
    const adapter = createPostgresSqlDatabase(connectionString);
    const repository = new MemoryRepository(adapter);
    const ownerId = `postgres-staging-${crypto.randomUUID()}`;

    try {
      const memory = await repository.insert({
        title: 'Postgres staging',
        project: 'phase-11',
        content: 'integration test body',
        summary: '',
        tags: ['staging'],
        keywords: ['staging'],
        category: '',
        memoryType: 'note',
        importance: 50,
        language: 'id',
        notes: '',
        codename: `PG-${ownerId.slice(0, 8)}`,
        slug: `pg-${ownerId.slice(0, 8)}`,
        favorite: false,
        ownerId,
      });

      const found = await repository.findById(memory.id, ownerId);
      expect(found?.title).toBe('Postgres staging');

      const leaked = await repository.findById(memory.id, 'other-owner');
      expect(leaked).toBeNull();
    } finally {
      await adapter.execute('DELETE FROM memories WHERE owner_id = ?', [ownerId]);
      const innerPool = adapter.unwrapPool();
      if (innerPool instanceof pg.Pool) {
        await innerPool.end();
      }
    }
  });
});
