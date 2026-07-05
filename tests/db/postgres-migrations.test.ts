import { describe, it, expect, vi } from 'vitest';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';
import { runPostgresMigrations } from '../../src/db/postgres-migrations.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';

function emptyExecuteResult(): SqlExecuteResult {
  return { results: [], meta: { changes: 0 } };
}

/** Tracks column existence for information_schema lookups (postgres dialect). */
class RecordingPostgresClient implements ISqlDatabase {
  readonly executeCalls: string[] = [];
  readonly queryCalls: Array<{ sql: string; params?: readonly unknown[] }> = [];

  constructor(private readonly existingColumns = new Map<string, Set<string>>()) {}

  addColumn(table: string, column: string): void {
    if (!this.existingColumns.has(table)) {
      this.existingColumns.set(table, new Set());
    }
    this.existingColumns.get(table)!.add(column);
  }

  async query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    this.queryCalls.push({ sql, params });

    if (/information_schema\.columns/i.test(sql) && params?.length === 2) {
      const table = String(params[0]);
      const column = String(params[1]);
      const exists = this.existingColumns.get(table)?.has(column) ?? false;
      return (exists ? [{ column_name: column }] : []) as T[];
    }

    return [] as T[];
  }

  async execute(sql: string, _params?: readonly unknown[]): Promise<SqlExecuteResult> {
    this.executeCalls.push(sql.trim());

    const addColumnMatch = /^ALTER TABLE (\w+) ADD COLUMN (\w+)/i.exec(sql);
    if (addColumnMatch) {
      const [, table, column] = addColumnMatch;
      this.addColumn(table!, column!);
    }

    return emptyExecuteResult();
  }
}

describe('runPostgresMigrations', () => {
  it('should apply core DDL statements', async () => {
    const client = new RecordingPostgresClient();

    await runPostgresMigrations(client);

    const sql = client.executeCalls.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memories');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS organizations');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memory_embeddings');
  });

  it('should use information_schema for column detection (not PRAGMA)', async () => {
    const client = new RecordingPostgresClient();

    await runPostgresMigrations(client);

    expect(client.queryCalls.some((call) => /information_schema\.columns/i.test(call.sql))).toBe(
      true,
    );
    expect(client.queryCalls.some((call) => /PRAGMA/i.test(call.sql))).toBe(false);
  });

  it('should skip ADD COLUMN when column already exists', async () => {
    const client = new RecordingPostgresClient();
    client.addColumn('workspaces', 'organization_id');

    await runPostgresMigrations(client);

    const alterCount = client.executeCalls.filter((s) =>
      /ALTER TABLE workspaces ADD COLUMN organization_id/i.test(s),
    ).length;
    expect(alterCount).toBe(0);
    expect(
      client.executeCalls.some((s) => /CREATE TABLE IF NOT EXISTS organizations/i.test(s)),
    ).toBe(true);
  });

  it('should be idempotent (second run does not throw)', async () => {
    const client = new RecordingPostgresClient();

    await runPostgresMigrations(client);
    const firstCallCount = client.executeCalls.length;

    await expect(runPostgresMigrations(client)).resolves.toBeUndefined();
    expect(client.executeCalls.length).toBeGreaterThanOrEqual(firstCallCount);
  });
});

describe('runSchemaMigrations dialect routing', () => {
  it('should use PRAGMA for sqlite dialect', async () => {
    const client: ISqlDatabase = {
      query: vi.fn(async (sql: string) => {
        if (/PRAGMA table_info\(memories\)/i.test(sql)) {
          return [{ name: 'owner_id' }];
        }
        if (/PRAGMA table_info\(clients\)/i.test(sql)) {
          return [{ name: 'owner_id' }];
        }
        if (/PRAGMA table_info\(workspaces\)/i.test(sql)) {
          return [{ name: 'organization_id' }];
        }
        if (/PRAGMA/i.test(sql)) {
          return [];
        }
        return [];
      }),
      execute: vi.fn(async () => emptyExecuteResult()),
    };

    await runSchemaMigrations(client, 'sqlite');

    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('PRAGMA table_info(memories)'),
    );
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining('information_schema'),
      expect.anything(),
    );
  });
});
