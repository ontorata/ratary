import type { D1Client } from '../../db/d1-client.js';
import type { ISqlDatabase, SqlExecuteResult } from '../../ports/sql/isql-database.port.js';

/** Bridges Cloudflare D1 HTTP client to the vendor-neutral SQL port. */
export class D1SqlDatabaseAdapter implements ISqlDatabase {
  constructor(private readonly client: D1Client) {}

  query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    return this.client.query<T>(sql, [...(params ?? [])]);
  }

  async execute(sql: string, params?: readonly unknown[]): Promise<SqlExecuteResult> {
    const result = await this.client.execute(sql, [...(params ?? [])]);
    return {
      results: result.results as Record<string, unknown>[],
      meta: result.meta
        ? {
            changes: result.meta.changes,
            lastRowId: result.meta.last_row_id,
            durationMs: result.meta.duration,
          }
        : undefined,
    };
  }

  /** Exposes underlying client for migration bootstrap only. */
  unwrapD1Client(): D1Client {
    return this.client;
  }
}
