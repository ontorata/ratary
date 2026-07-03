import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { runSchemaMigrations } from './migrations.js';

/**
 * Idempotent Postgres schema bootstrap (ADR-018 / Phase 11).
 * Applies the same canonical DDL as D1 via ISqlDatabase + PostgresSqlDatabaseAdapter.
 */
export async function runPostgresMigrations(client: ISqlDatabase): Promise<void> {
  await runSchemaMigrations(client, 'postgres');
}
