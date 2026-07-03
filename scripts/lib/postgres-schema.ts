import pg from 'pg';
import { getEnv, type Env } from '../../src/config/env.js';
import { runPostgresMigrations } from '../../src/db/postgres-migrations.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import { PostgresSqlDatabaseAdapter } from '../../src/infrastructure/sql/postgres-sql-database.adapter.js';

export function resolvePostgresConnectionString(env: Env = getEnv()): string {
  if (env.SQL_PROVIDER !== 'postgres') {
    throw new Error(
      'SQL_PROVIDER must be "postgres". Set SQL_PROVIDER=postgres and DATABASE_URL before running schema apply.',
    );
  }

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when SQL_PROVIDER=postgres');
  }

  return env.DATABASE_URL;
}

/** Applies canonical migrations to an existing ISqlDatabase (test hook). */
export async function applyPostgresSchemaToDatabase(sql: ISqlDatabase): Promise<void> {
  await runPostgresMigrations(sql);
}

/**
 * Connect to Postgres, apply idempotent schema bootstrap, and close the pool.
 * ADR-018 Phase 11 — staging harness + cutover prerequisite.
 */
export async function applyPostgresSchema(connectionString: string): Promise<void> {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PostgresSqlDatabaseAdapter(pool);

  try {
    await applyPostgresSchemaToDatabase(adapter);
  } finally {
    await pool.end();
  }
}
