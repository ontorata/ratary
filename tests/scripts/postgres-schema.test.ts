import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';
import { resetEnvCache } from '../../src/config/env.js';
import {
  applyPostgresSchemaToDatabase,
  resolvePostgresConnectionString,
} from '../../scripts/lib/postgres-schema.js';
import * as postgresMigrations from '../../src/db/postgres-migrations.js';

describe('resolvePostgresConnectionString', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvCache();
  });

  it('should return DATABASE_URL when SQL_PROVIDER=postgres', () => {
    process.env.SQL_PROVIDER = 'postgres';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.NODE_ENV = 'test';

    expect(resolvePostgresConnectionString()).toBe('postgresql://user:pass@localhost:5432/test');
  });

  it('should throw when SQL_PROVIDER is not postgres', () => {
    process.env.SQL_PROVIDER = 'd1';
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acc';
    process.env.D1_DATABASE_ID = 'db';
    process.env.D1_API_TOKEN = 'token';
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.NODE_ENV = 'test';

    expect(() => resolvePostgresConnectionString()).toThrow(/SQL_PROVIDER must be "postgres"/);
  });

  it('should throw when DATABASE_URL is missing', () => {
    process.env.SQL_PROVIDER = 'postgres';
    delete process.env.DATABASE_URL;
    process.env.AUTH_SECRET = 'test-auth-secret-minimum-32-characters!!';
    process.env.NODE_ENV = 'test';

    expect(() => resolvePostgresConnectionString()).toThrow(/DATABASE_URL is required/);
  });
});

describe('applyPostgresSchemaToDatabase', () => {
  it('should delegate to runPostgresMigrations', async () => {
    const spy = vi.spyOn(postgresMigrations, 'runPostgresMigrations').mockResolvedValue(undefined);
    const sql: ISqlDatabase = {
      query: vi.fn(async () => []),
      execute: vi.fn(async (): Promise<SqlExecuteResult> => ({ results: [] })),
    };

    await applyPostgresSchemaToDatabase(sql);

    expect(spy).toHaveBeenCalledWith(sql);
    spy.mockRestore();
  });
});
