import { DatabaseSync } from 'node:sqlite';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';

export class SqliteMemoryDatabase implements ISqlDatabase {
  private readonly db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(':memory:');
    this.db.exec('PRAGMA foreign_keys = ON');
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: readonly unknown[] = [],
  ): Promise<T[]> {
    const statement = this.db.prepare(sql);
    return statement.all(...params) as T[];
  }

  async execute(sql: string, params: readonly unknown[] = []): Promise<SqlExecuteResult> {
    const statement = this.db.prepare(sql);
    const result = statement.run(...params);
    return {
      results: [],
      meta: {
        changes: result.changes,
        lastRowId: Number(result.lastInsertRowid),
      },
    };
  }

  close(): void {
    this.db.close();
  }
}
