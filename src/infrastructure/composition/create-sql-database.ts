import type { D1Client } from '../../db/d1-client.js';
import type { Env } from '../../config/env.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { D1SqlDatabaseAdapter } from '../sql/d1-sql-database.adapter.js';
import { createPostgresSqlDatabase } from '../sql/postgres-sql-database.adapter.js';
import { createMariaDBSqlDatabaseFromUri } from '../sql/mariadb-sql-database.adapter.js';

export function createSqlDatabase(d1Client: D1Client | null, env: Env): ISqlDatabase {
  if (
    env.SQL_PROVIDER === 'postgres' ||
    env.SQL_PROVIDER === 'tidb' ||
    env.SQL_PROVIDER === 'cockroachdb' ||
    env.SQL_PROVIDER === 'supabase'
  ) {
    if (!env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is required when SQL_PROVIDER=postgres, tidb, cockroachdb, or supabase',
      );
    }
    return createPostgresSqlDatabase(env.DATABASE_URL);
  }

  if (env.SQL_PROVIDER === 'mariadb' || env.SQL_PROVIDER === 'mysql') {
    if (!env.MARIADB_CONNECTION_STRING) {
      throw new Error(
        'MARIADB_CONNECTION_STRING is required when SQL_PROVIDER=mariadb or SQL_PROVIDER=mysql',
      );
    }
    return createMariaDBSqlDatabaseFromUri(env.MARIADB_CONNECTION_STRING);
  }

  if (!d1Client) {
    throw new Error('D1Client is required when SQL_PROVIDER=d1');
  }

  return new D1SqlDatabaseAdapter(d1Client);
}
