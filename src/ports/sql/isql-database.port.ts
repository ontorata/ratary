/**
 * Vendor-neutral SQL execution port.
 * Adapters: D1, PostgreSQL, MariaDB, MySQL, SQLite, CockroachDB, TiDB, PlanetScale, SQL Server, Oracle.
 * @see docs/adr/008-platform-architecture.md
 */
export interface SqlExecuteResult {
  results: Record<string, unknown>[];
  meta?: {
    changes?: number;
    lastRowId?: number;
    durationMs?: number;
  };
}

export interface ISqlDatabase {
  query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]>;
  execute(sql: string, params?: readonly unknown[]): Promise<SqlExecuteResult>;
}
