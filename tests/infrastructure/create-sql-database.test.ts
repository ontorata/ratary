import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { resetEnvCache } from '../../src/config/index.js';
import { createSqlDatabase } from '../../src/infrastructure/composition/create-sql-database.js';
import { D1SqlDatabaseAdapter } from '../../src/infrastructure/sql/d1-sql-database.adapter.js';
import { PostgresSqlDatabaseAdapter } from '../../src/infrastructure/sql/postgres-sql-database.adapter.js';
import { getEnv } from '../../src/config/index.js';

class MinimalD1Client implements D1Client {
  async query<T = Record<string, unknown>>(): Promise<T[]> {
    return [] as T[];
  }

  async execute(): Promise<D1QueryResult> {
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('createSqlDatabase', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('should return D1SqlDatabaseAdapter by default', () => {
    vi.stubEnv('SQL_PROVIDER', 'd1');
    const sql = createSqlDatabase(new MinimalD1Client(), getEnv());
    expect(sql).toBeInstanceOf(D1SqlDatabaseAdapter);
  });

  it('should return PostgresSqlDatabaseAdapter when configured', () => {
    vi.stubEnv('SQL_PROVIDER', 'postgres');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/ratary_test');
    const sql = createSqlDatabase(new MinimalD1Client(), getEnv());
    expect(sql).toBeInstanceOf(PostgresSqlDatabaseAdapter);
  });
});
