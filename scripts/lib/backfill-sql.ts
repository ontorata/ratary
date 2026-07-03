import { getD1Client } from '../../src/db/index.js';
import { runMigrations } from '../../src/db/migrations.js';
import { getEnv } from '../../src/config/env.js';
import { createSqlDatabase } from '../../src/infrastructure/composition/create-sql-database.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';

export async function createBackfillSourceSql(): Promise<ISqlDatabase> {
  const env = getEnv();
  const d1Client = env.SQL_PROVIDER === 'd1' ? getD1Client() : null;
  if (d1Client) {
    await runMigrations(d1Client);
  }
  return createSqlDatabase(d1Client, env);
}
