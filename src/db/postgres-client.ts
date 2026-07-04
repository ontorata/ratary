import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';

let sqlInstance: ISqlDatabase | null = null;

/**
 * Returns the injected ISqlDatabase instance, or null if none has been set.
 * Used by test harnesses to inject a mock or real Postgres adapter.
 */
export function getPostgresSqlDatabase(): ISqlDatabase | null {
  return sqlInstance;
}

/**
 * Injects an ISqlDatabase instance for use when SQL_PROVIDER=postgres.
 * Used by test harnesses to inject a mock Postgres adapter.
 * Call `resetPostgresSqlDatabase()` in afterEach to clean up.
 */
export function setPostgresSqlDatabase(sql: ISqlDatabase): void {
  sqlInstance = sql;
}

/** Clears the injected ISqlDatabase. Call in test afterEach. */
export function resetPostgresSqlDatabase(): void {
  sqlInstance = null;
}
