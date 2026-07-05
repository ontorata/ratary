import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import type { ISqlDatabase, SqlExecuteResult } from '../../ports/sql/isql-database.port.js';

/**
 * MariaDB/MySQL adapter for ISqlDatabase (ADR-065 / Phase 30A).
 * Uses mysql2/promise prepared statements (execute) for all queries.
 * Supports `SQL_PROVIDER=mariadb` and `SQL_PROVIDER=mysql`.
 */
export class MariaDBSqlDatabaseAdapter implements ISqlDatabase {
  constructor(private readonly pool: Pool) {}

  async query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    const values = params ? [...params] : [];
    // mysql2 Pool.query/execute overloads don't resolve with readonly unknown[] params; cast at call site
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rows] = (await (this.pool as any).query(sql, values)) as [
      mysql.RowDataPacket[],
      unknown[],
    ];
    return rows as T[];
  }

  async execute(sql: string, params?: readonly unknown[]): Promise<SqlExecuteResult> {
    const values = params ? [...params] : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result] = (await (this.pool as any).execute(sql, values)) as [
      mysql.ResultSetHeader,
      unknown[],
    ];
    return {
      results: [],
      meta: {
        changes: result.affectedRows,
        lastRowId: result.insertId,
      },
    };
  }

  /** Closes the underlying connection pool. Call at app shutdown. */
  async closePool(): Promise<void> {
    await this.pool.end();
  }
}

export interface CreateMariaDBSqlDatabaseInput {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  ssl?: { rejectUnauthorized?: boolean };
}

/**
 * Creates a MariaDB/MySQL adapter from individual connection parameters.
 */
export function createMariaDBSqlDatabase(
  input: CreateMariaDBSqlDatabaseInput,
): MariaDBSqlDatabaseAdapter {
  const pool = mysql.createPool({
    host: input.host,
    port: input.port ?? 3306,
    user: input.user,
    password: input.password,
    database: input.database,
    connectionLimit: input.connectionLimit ?? 10,
    ssl: input.ssl,
    waitForConnections: true,
    queueLimit: 0,
  });
  return new MariaDBSqlDatabaseAdapter(pool);
}

/**
 * Creates a MariaDB/MySQL adapter from a connection string (mysql:// or mariadb:// URI).
 */
export function createMariaDBSqlDatabaseFromUri(connectionUri: string): MariaDBSqlDatabaseAdapter {
  const pool = mysql.createPool({
    uri: connectionUri,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return new MariaDBSqlDatabaseAdapter(pool);
}
