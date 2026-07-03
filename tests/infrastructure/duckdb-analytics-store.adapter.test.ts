import { describe, expect, it } from 'vitest';
import {
  DUCKDB_ANALYTICS_QUERY_TEMPLATES,
  DuckDbAnalyticsStore,
} from '../../src/infrastructure/analytics/duckdb/duckdb-analytics-store.adapter.js';
import type { DuckDbExecutor } from '../../src/infrastructure/analytics/duckdb/duckdb-executor.interface.js';
import { describeAnalyticsStoreContract } from './contracts/ianalytics-store.contract.js';

class InMemoryDuckDbExecutor implements DuckDbExecutor {
  private readonly tables = new Map<string, Record<string, unknown>[]>();

  async run(sql: string, params: readonly unknown[] = []): Promise<void> {
    const match = /^INSERT INTO "([^"]+)" \(([^)]+)\) VALUES \(([^)]+)\)$/i.exec(sql);
    if (!match) {
      throw new Error(`Unsupported SQL in test executor: ${sql}`);
    }
    const table = match[1]!;
    const columns = match[2]!.split(',').map((column) => column.trim().replace(/"/g, ''));
    const row: Record<string, unknown> = {};
    columns.forEach((column, index) => {
      row[column] = params[index];
    });
    const rows = this.tables.get(table) ?? [];
    rows.push(row);
    this.tables.set(table, rows);
  }

  async all<T = Record<string, unknown>>(
    sql: string,
    params: readonly unknown[] = [],
  ): Promise<T[]> {
    if (sql.includes('memory_access_events') && sql.includes('owner_id')) {
      const ownerId = params[0];
      const rows = this.tables.get('memory_access_events') ?? [];
      const count = rows.filter((row) => row.owner_id === ownerId).length;
      return [{ owner_id: ownerId, access_count: count }] as T[];
    }
    return [];
  }
}

describe('DuckDbAnalyticsStore', () => {
  describeAnalyticsStoreContract('duckdb in-memory executor', () => {
    return new DuckDbAnalyticsStore(new InMemoryDuckDbExecutor(), {
      queryTemplates: DUCKDB_ANALYTICS_QUERY_TEMPLATES,
    });
  });

  it('should expose access_count_by_owner query template', () => {
    expect(DUCKDB_ANALYTICS_QUERY_TEMPLATES.access_count_by_owner).toContain(
      'memory_access_events',
    );
  });
});
