export interface ClickHouseExecutor {
  insert(table: string, rows: readonly Record<string, unknown>[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params?: Record<string, unknown>): Promise<T[]>;
}

export interface ClickHouseAnalyticsStoreConfig {
  queryTemplates: Record<string, string>;
}
