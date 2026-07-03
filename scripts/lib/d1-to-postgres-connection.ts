import pg from 'pg';
import { getD1Client } from '../../src/db/index.js';
import { runMigrations } from '../../src/db/migrations.js';
import { runPostgresMigrations } from '../../src/db/postgres-migrations.js';
import { D1SqlDatabaseAdapter } from '../../src/infrastructure/sql/d1-sql-database.adapter.js';
import { createPostgresSqlDatabase } from '../../src/infrastructure/sql/postgres-sql-database.adapter.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import { parseTargetUrlArg } from './backfill-cli.js';

export async function createD1BackfillSource(): Promise<ISqlDatabase> {
  const client = getD1Client();
  await runMigrations(client);
  return new D1SqlDatabaseAdapter(client);
}

export async function createPostgresBackfillTarget(connectionString: string): Promise<{
  sql: ISqlDatabase;
  close: () => Promise<void>;
}> {
  const adapter = createPostgresSqlDatabase(connectionString);
  await runPostgresMigrations(adapter);

  return {
    sql: adapter,
    close: async () => {
      const pool = adapter.unwrapPool();
      if (pool instanceof pg.Pool) {
        await pool.end();
      }
    },
  };
}

export function resolvePostgresTargetUrl(argv: string[]): string {
  const override = parseTargetUrlArg(argv);
  if (override) {
    return override;
  }
  const fromEnv = process.env.DATABASE_URL;
  if (!fromEnv) {
    throw new Error(
      'DATABASE_URL is required for Postgres target (or pass --target-url=postgresql://...)',
    );
  }
  return fromEnv;
}
