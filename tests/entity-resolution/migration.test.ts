/**
 * Phase 35 / ADR-068 D1 — T2 contract: entity resolution migration is
 * additive-only (three new tables, existing schema untouched) and idempotent.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { migrateEntityResolutionPhase1, runSchemaMigrations } from '../../src/db/migrations.js';

interface SqliteSchemaRow {
  type: string;
  name: string;
  tbl_name: string;
  sql: string | null;
}

async function snapshotSchema(db: SqliteMemoryDatabase): Promise<SqliteSchemaRow[]> {
  return db.query<SqliteSchemaRow>(
    `SELECT type, name, tbl_name, sql FROM sqlite_master
     WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name`,
  );
}

describe('entity resolution migration (ADR-068 D1)', () => {
  let db: SqliteMemoryDatabase;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
  });

  afterAll(() => {
    db?.close();
  });

  it('creates the three entity tables with unique indexes', async () => {
    const schema = await snapshotSchema(db);
    const names = schema.map((row) => row.name);

    expect(names).toContain('canonical_entities');
    expect(names).toContain('entity_aliases');
    expect(names).toContain('entity_mentions');
    expect(names).toContain('idx_canonical_entities_owner_name_kind');
    expect(names).toContain('idx_entity_aliases_owner_alias');
    expect(names).toContain('idx_entity_mentions_owner_memory_entity_field');
  });

  it('does not alter existing tables (additive-only)', async () => {
    const memoriesColumns = await db.query<{ name: string }>('PRAGMA table_info(memories)');
    const relationColumns = await db.query<{ name: string }>('PRAGMA table_info(memory_relations)');

    const entityColumnLeak = [...memoriesColumns, ...relationColumns].filter((col) =>
      col.name.startsWith('entity'),
    );
    expect(entityColumnLeak).toEqual([]);
  });

  it('is idempotent: re-running leaves the schema byte-identical', async () => {
    const before = await snapshotSchema(db);
    await migrateEntityResolutionPhase1(db);
    await runSchemaMigrations(db, 'sqlite');
    const after = await snapshotSchema(db);
    expect(after).toEqual(before);
  });

  it('enforces unique constraints per ADR-068 D1', async () => {
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO canonical_entities (id, owner_id, canonical_name, normalized_name, kind, created_at, updated_at)
       VALUES ('e1', 'o1', 'Ratary', 'ratary', 'project', ?, ?)`,
      [now, now],
    );
    await expect(
      db.execute(
        `INSERT INTO canonical_entities (id, owner_id, canonical_name, normalized_name, kind, created_at, updated_at)
         VALUES ('e2', 'o1', 'RATARY', 'ratary', 'project', ?, ?)`,
        [now, now],
      ),
    ).rejects.toThrow();

    await db.execute(
      `INSERT INTO entity_aliases (id, owner_id, entity_id, alias, normalized_alias, created_at)
       VALUES ('a1', 'o1', 'e1', 'AI Brain', 'ai brain', ?)`,
      [now],
    );
    await expect(
      db.execute(
        `INSERT INTO entity_aliases (id, owner_id, entity_id, alias, normalized_alias, created_at)
         VALUES ('a2', 'o1', 'e1', 'ai-brain', 'ai brain', ?)`,
        [now],
      ),
    ).rejects.toThrow();

    await db.execute(
      `INSERT INTO entity_mentions (id, owner_id, memory_id, entity_id, field, confidence, created_at)
       VALUES ('m1', 'o1', 'mem-1', 'e1', 'codename', 1.0, ?)`,
      [now],
    );
    await expect(
      db.execute(
        `INSERT INTO entity_mentions (id, owner_id, memory_id, entity_id, field, confidence, created_at)
         VALUES ('m2', 'o1', 'mem-1', 'e1', 'codename', 0.9, ?)`,
        [now],
      ),
    ).rejects.toThrow();
  });
});
