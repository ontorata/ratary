import type {
  AnalyticsQuery,
  AnalyticsRow,
  IAnalyticsStore,
} from '../../../ports/analytics/ianalytics-store.port.js';
import type {
  ClickHouseAnalyticsStoreConfig,
  ClickHouseExecutor,
} from './clickhouse-executor.interface.js';

/**
 * ClickHouse analytics store — production OLAP for IAnalyticsStore (ADR-065 / Phase 30C).
 */
export class ClickHouseAnalyticsStore implements IAnalyticsStore {
  constructor(
    private readonly executor: ClickHouseExecutor,
    private readonly config: ClickHouseAnalyticsStoreConfig,
  ) {}

  async insert(table: string, rows: readonly Record<string, unknown>[]): Promise<void> {
    if (rows.length === 0) {
      return;
    }
    await this.executor.insert(table, rows);
  }

  async query(query: AnalyticsQuery): Promise<AnalyticsRow[]> {
    const template = this.config.queryTemplates[query.name];
    if (!template) {
      throw new Error(`Unknown analytics query: ${query.name}`);
    }
    const params = query.params ?? {};
    const rows = await this.executor.query<Record<string, unknown>>(template, params);
    return rows.map((columns) => ({ columns }));
  }
}

export const CLICKHOUSE_ANALYTICS_DDL = `
CREATE TABLE IF NOT EXISTS memory_access_events (
  id String,
  owner_id String,
  memory_id String,
  accessed_at DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (owner_id, accessed_at);
`;

export const CLICKHOUSE_ANALYTICS_QUERY_TEMPLATES: Record<string, string> = {
  access_count_by_owner:
    'SELECT owner_id, count() AS access_count FROM memory_access_events WHERE owner_id = {owner_id:String} GROUP BY owner_id',
};
