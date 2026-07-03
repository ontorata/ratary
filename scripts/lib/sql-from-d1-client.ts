import type { D1Client } from '../../src/db/d1-client.js';
import { D1SqlDatabaseAdapter } from '../../src/infrastructure/sql/d1-sql-database.adapter.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';

export function sqlFromD1Client(client: D1Client): ISqlDatabase {
  return new D1SqlDatabaseAdapter(client);
}
