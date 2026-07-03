import type {
  AnalyticsQuery,
  AnalyticsRow,
  IAnalyticsStore,
} from '../../../ports/analytics/ianalytics-store.port.js';
import type { DuckDbAnalyticsStoreConfig, DuckDbExecutor } from './duckdb-executor.interface.js';

/**
 * DuckDB analytics store — dev/staging reference for IAnalyticsStore (ADR-013).
 */
export class DuckDbAnalyticsStore implements IAnalyticsStore {
  constructor(
    private readonly executor: DuckDbExecutor,
    private readonly config: DuckDbAnalyticsStoreConfig,
  ) {}

  async insert(table: string, rows: readonly Record<string, unknown>[]): Promise<void> {
    if (rows.length === 0) {
      return;
    }

    const columns = Object.keys(rows[0]!);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(', ')}) VALUES (${placeholders})`;

    for (const row of rows) {
      const params = columns.map((column) => row[column]);
      await this.executor.run(sql, params);
    }
  }

  async query(query: AnalyticsQuery): Promise<AnalyticsRow[]> {
    const template = this.config.queryTemplates[query.name];
    if (!template) {
      throw new Error(`Unknown analytics query: ${query.name}`);
    }

    const params = query.params ? Object.values(query.params) : [];
    const rows = await this.executor.all<Record<string, unknown>>(template, params);
    return rows.map((columns) => ({ columns }));
  }
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export const DUCKDB_ANALYTICS_DDL = `
CREATE TABLE IF NOT EXISTS memory_access_events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  memory_id TEXT NOT NULL,
  accessed_at TIMESTAMPTZ NOT NULL
);
`;

export const DUCKDB_ANALYTICS_QUERY_TEMPLATES: Record<string, string> = {
  access_count_by_owner:
    'SELECT owner_id, COUNT(*) AS access_count FROM memory_access_events WHERE owner_id = ? GROUP BY owner_id',
};
