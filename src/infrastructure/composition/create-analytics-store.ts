import duckdb from 'duckdb';
import type { Env } from '../../config/env.js';
import type { IAnalyticsStore } from '../../ports/analytics/ianalytics-store.port.js';
import { NoOpAnalyticsStore } from '../analytics/noop-analytics-store.adapter.js';
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
