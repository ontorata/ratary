import { describe, it, expect } from 'vitest';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';
import {
  backfillD1ToPostgres,
  METADATA_BACKFILL_TABLES,
} from '../../scripts/lib/d1-to-postgres-backfill.js';
import { verifyPostgresParity } from '../../scripts/lib/postgres-parity.js';
import { parseTargetUrlArg } from '../../scripts/lib/backfill-cli.js';

type Row = Record<string, unknown>;

class InMemorySql implements ISqlDatabase {
  readonly tables = new Map<string, Map<string, Row>>();
  readonly executeLog: Array<{ sql: string; params?: readonly unknown[] }> = [];

  seed(table: string, primaryKey: string, rows: Row[]): void {
    const store = new Map<string, Row>();
    for (const row of rows) {
      store.set(String(row[primaryKey]), { ...row });
    }
    this.tables.set(table, store);
  }

  async query<T = Row>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    const countMatch = /^SELECT COUNT\(\*\) AS count FROM (\w+)/i.exec(sql);
    if (countMatch) {
      const table = countMatch[1]!;
      const rows = [...(this.tables.get(table)?.values() ?? [])];
      const filtered = this.applyOwnerFilter(sql, params, rows);
      return [{ count: filtered.length }] as T[];
    }

    const selectMatch = /^SELECT .+ FROM (\w+)/i.exec(sql);
    if (selectMatch) {
      const table = selectMatch[1]!;
      const rows = [...(this.tables.get(table)?.values() ?? [])];
      const filtered = this.applyOwnerFilter(sql, params, rows);
      const offset = Number(params?.[params.length - 1] ?? 0);
      const limit = Number(params?.[params.length - 2] ?? filtered.length);
      return filtered.slice(offset, offset + limit) as T[];
    }

    return [] as T[];
  }

  private applyOwnerFilter(
    sql: string,
    params: readonly unknown[] | undefined,
    rows: Row[],
  ): Row[] {
    if (!sql.includes('WHERE') || !params?.length) {
      return rows;
    }
    if (sql.includes('owner_id = ?')) {
      const ownerId = params[0];
      return rows.filter((row) => row.owner_id === ownerId);
    }
    if (sql.includes('organization_id IN')) {
      const ownerId = params[0];
      const orgIds = [...(this.tables.get('organizations')?.values() ?? [])]
        .filter((row) => row.owner_id === ownerId)
        .map((row) => row.id);
      return rows.filter((row) => orgIds.includes(row.organization_id));
    }
    return rows;
  }

  async execute(sql: string, params?: readonly unknown[]): Promise<SqlExecuteResult> {
    this.executeLog.push({ sql, params });

    const insertMatch = /^INSERT INTO (\w+)/i.exec(sql);
    if (insertMatch && params) {
      const table = insertMatch[1]!;
      const spec = METADATA_BACKFILL_TABLES.find((entry) => entry.table === table);
      if (!spec) {
        return { results: [] };
      }
      const row: Row = {};
      spec.columns.forEach((column, index) => {
        row[column] = params[index];
      });
      if (!this.tables.has(table)) {
        this.tables.set(table, new Map());
      }
      this.tables.get(table)!.set(String(row[spec.primaryKey]), row);
    }

    return { results: [], meta: { changes: 1 } };
  }
}

describe('parseTargetUrlArg', () => {
  it('should parse --target-url flag', () => {
    expect(parseTargetUrlArg(['--target-url=postgresql://localhost/db'])).toBe(
      'postgresql://localhost/db',
    );
  });
});

describe('backfillD1ToPostgres', () => {
  it('should dry-run without target writes', async () => {
    const source = new InMemorySql();
    const target = new InMemorySql();
    source.seed('organizations', 'id', [
      { id: 'org-1', owner_id: 'owner-a', name: 'Default', slug: 'default', created_at: 't' },
    ]);
    source.seed('settings', 'key', [{ key: 'bootstrap.completed', value: 'true' }]);

    const result = await backfillD1ToPostgres({
      source,
      target,
      batchSize: 10,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.tables.find((row) => row.table === 'organizations')?.scanned).toBe(1);
    expect(target.executeLog.length).toBe(0);
  });

  it('should upsert rows to target on execute', async () => {
    const source = new InMemorySql();
    const target = new InMemorySql();
    source.seed('settings', 'key', [{ key: 'bootstrap.completed', value: 'true' }]);

    await backfillD1ToPostgres({
      source,
      target,
      batchSize: 10,
      dryRun: false,
    });

    expect(target.tables.get('settings')?.get('bootstrap.completed')).toEqual({
      key: 'bootstrap.completed',
      value: 'true',
    });
  });

  it('should filter by owner when --owner is used', async () => {
    const source = new InMemorySql();
    const target = new InMemorySql();
    source.seed('memories', 'id', [
      {
        id: 'm1',
        owner_id: 'owner-a',
        title: 'A',
        project: '',
        content: 'c',
        summary: '',
        tags: '[]',
        favorite: 0,
        archived: 0,
        codename: null,
        slug: null,
        keywords: '[]',
        category: '',
        memory_type: 'note',
        importance: 50,
        language: 'id',
        notes: '',
        project_id: '',
        level: 'note',
        last_accessed: null,
        access_count: 0,
        embedding_id: null,
        object_key: null,
        semantic_hash: null,
        workspace_id: null,
        last_modified_by_agent_id: null,
        created_at: 't',
        updated_at: 't',
      },
      {
        id: 'm2',
        owner_id: 'owner-b',
        title: 'B',
        project: '',
        content: 'c',
        summary: '',
        tags: '[]',
        favorite: 0,
        archived: 0,
        codename: null,
        slug: null,
        keywords: '[]',
        category: '',
        memory_type: 'note',
        importance: 50,
        language: 'id',
        notes: '',
        project_id: '',
        level: 'note',
        last_accessed: null,
        access_count: 0,
        embedding_id: null,
        object_key: null,
        semantic_hash: null,
        workspace_id: null,
        last_modified_by_agent_id: null,
        created_at: 't',
        updated_at: 't',
      },
    ]);

    const result = await backfillD1ToPostgres({
      source,
      target,
      ownerId: 'owner-a',
      batchSize: 10,
      dryRun: true,
    });

    expect(result.tables.find((row) => row.table === 'memories')?.scanned).toBe(1);
  });
});

describe('verifyPostgresParity', () => {
  it('should pass when counts match', async () => {
    const source = new InMemorySql();
    const target = new InMemorySql();
    source.seed('settings', 'key', [{ key: 'k', value: 'v' }]);
    target.seed('settings', 'key', [{ key: 'k', value: 'v' }]);

    const result = await verifyPostgresParity({ source, target });
    expect(result.ok).toBe(true);
  });

  it('should fail when counts differ', async () => {
    const source = new InMemorySql();
    const target = new InMemorySql();
    source.seed('settings', 'key', [{ key: 'k1', value: 'v' }]);
    target.seed('settings', 'key', []);

    const result = await verifyPostgresParity({ source, target });
    expect(result.ok).toBe(false);
    expect(result.tables.find((row) => row.table === 'settings')?.match).toBe(false);
  });
});
