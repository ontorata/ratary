/** Injectable DuckDB executor for analytics adapter (ADR-013). */
export interface DuckDbExecutor {
  run(sql: string, params?: readonly unknown[]): Promise<void>;
  all<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]>;
}

export interface DuckDbAnalyticsStoreConfig {
  /** Named SQL templates keyed by AnalyticsQuery.name */
  queryTemplates: Record<string, string>;
}
