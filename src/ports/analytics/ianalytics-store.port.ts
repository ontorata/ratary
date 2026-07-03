/**
 * Vendor-neutral analytics / OLAP write and query port.
 * Adapters: ClickHouse, Snowflake, BigQuery, DuckDB.
 * @see docs/adr/008-platform-architecture.md
 */
export interface AnalyticsQuery {
  /** Adapter-specific query name or statement identifier. */
  name: string;
  params?: Record<string, unknown>;
}

export interface AnalyticsRow {
  columns: Record<string, unknown>;
}

export interface IAnalyticsStore {
  insert(table: string, rows: readonly Record<string, unknown>[]): Promise<void>;
  query(query: AnalyticsQuery): Promise<AnalyticsRow[]>;
}
