import type { ISqlDatabase } from '../../../src/ports/sql/isql-database.port.js';
import { runSchemaMigrations } from '../../../src/db/migrations.js';

/** Full schema for Studio identity E2E (native auth + memory data-plane). */
export async function setupStudioE2eDatabase(db: ISqlDatabase): Promise<void> {
  await runSchemaMigrations(db, 'sqlite');
}
