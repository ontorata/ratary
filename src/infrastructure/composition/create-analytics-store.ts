import duckdb from 'duckdb';
import { createClient } from '@clickhouse/client';
import type { Env } from '../../config/env.js';
import type { IAnalyticsStore } from '../../ports/analytics/ianalytics-store.port.js';
import { NoOpAnalyticsStore } from '../analytics/noop-analytics-store.adapter.js';
import {
  CLICKHOUSE_ANALYTICS_DDL,
  CLICKHOUSE_ANALYTICS_QUERY_TEMPLATES,
  ClickHouseAnalyticsStore,
} from '../analytics/clickhouse/clickhouse-analytics-store.adapter.js';
import type { ClickHouseExecutor } from '../analytics/clickhouse/clickhouse-executor.interface.js';
import {
  DUCKDB_ANALYTICS_DDL,
  DUCKDB_ANALYTICS_QUERY_TEMPLATES,
  DuckDbAnalyticsStore,
} from '../analytics/duckdb/duckdb-analytics-store.adapter.js';
import type { DuckDbExecutor } from '../analytics/duckdb/duckdb-executor.interface.js';

export function createAnalyticsStore(env: Env): IAnalyticsStore {
  if (env.ANALYTICS_PROVIDER === 'duckdb') {
    const executor = createDuckDbExecutor(env.DUCKDB_PATH);
    return new DuckDbAnalyticsStore(executor, {
      queryTemplates: DUCKDB_ANALYTICS_QUERY_TEMPLATES,
    });
  }

  if (env.ANALYTICS_PROVIDER === 'clickhouse') {
    if (!env.CLICKHOUSE_URL) {
      throw new Error('CLICKHOUSE_URL is required when ANALYTICS_PROVIDER=clickhouse');
    }
    const executor = createClickHouseExecutor({
      url: env.CLICKHOUSE_URL,
      database: env.CLICKHOUSE_DATABASE,
      username: env.CLICKHOUSE_USERNAME,
      password: env.CLICKHOUSE_PASSWORD,
    });
    return new ClickHouseAnalyticsStore(executor, {
      queryTemplates: CLICKHOUSE_ANALYTICS_QUERY_TEMPLATES,
    });
  }

  if (env.ANALYTICS_PROVIDER !== 'none') {
    throw new Error(`ANALYTICS_PROVIDER=${env.ANALYTICS_PROVIDER} is not implemented`);
  }

  return new NoOpAnalyticsStore();
}

export function createDuckDbExecutor(dbPath: string): DuckDbExecutor {
  const database = new duckdb.Database(dbPath);
  const connection = database.connect();
  connection.run(DUCKDB_ANALYTICS_DDL);

  return {
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        connection.run(sql, ...params, (error: Error | null) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
    all<T = Record<string, unknown>>(sql: string, params: readonly unknown[] = []) {
      return new Promise<T[]>((resolve, reject) => {
        connection.all(sql, ...params, (error: Error | null, rows: unknown) => {
          if (error) {
            reject(error);
            return;
          }
          resolve((rows ?? []) as T[]);
        });
      });
    },
  };
}

export interface CreateClickHouseExecutorInput {
  url: string;
  database: string;
  username: string;
  password?: string;
}

export function createClickHouseExecutor(input: CreateClickHouseExecutorInput): ClickHouseExecutor {
  const client = createClient({
    url: input.url,
    database: input.database,
    username: input.username,
    password: input.password,
  });

  void client.command({ query: CLICKHOUSE_ANALYTICS_DDL });

  return {
    async insert(table, rows) {
      await client.insert({
        table,
        values: rows,
        format: 'JSONEachRow',
      });
    },
    async query<T = Record<string, unknown>>(sql: string, params: Record<string, unknown> = {}) {
      const result = await client.query({
        query: sql,
        query_params: params,
        format: 'JSONEachRow',
      });
      const rows = await result.json<T>();
      return Array.isArray(rows) ? rows : [];
    },
  };
}
