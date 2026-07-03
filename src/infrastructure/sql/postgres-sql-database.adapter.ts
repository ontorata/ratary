import pg from 'pg';
import type { ISqlDatabase, SqlExecuteResult } from '../../ports/sql/isql-database.port.js';
import { translateQuestionMarkPlaceholders } from '../_shared/sql-placeholders.js';

export interface PostgresPoolQueryable {
  query(text: string, values?: unknown[]): Promise<pg.QueryResult>;
}

/**
 * PostgreSQL adapter for ISqlDatabase (ADR-009).
 * Translates D1-style `?` placeholders to `$1`, `$2`, … for repository SQL reuse.
 */
export class PostgresSqlDatabaseAdapter implements ISqlDatabase {
  constructor(private readonly pool: PostgresPoolQueryable) {}

  async query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    const result = await this.pool.query(translateQuestionMarkPlaceholders(sql), [
      ...(params ?? []),
    ]);
    return result.rows as T[];
  }

  async execute(sql: string, params?: readonly unknown[]): Promise<SqlExecuteResult> {
    const result = await this.pool.query(translateQuestionMarkPlaceholders(sql), [
      ...(params ?? []),
    ]);
    return {
      results: result.rows as Record<string, unknown>[],
      meta: {
        changes: result.rowCount ?? 0,
      },
    };
  }

  /** Exposes underlying pool for graceful shutdown at composition root. */
  unwrapPool(): PostgresPoolQueryable {
    return this.pool;
  }
}

export function createPostgresSqlDatabase(connectionString: string): PostgresSqlDatabaseAdapter {
  return new PostgresSqlDatabaseAdapter(new pg.Pool({ connectionString }));
}
