import type { D1Client } from '../../src/db/d1-client.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import { D1SqlDatabaseAdapter } from '../../src/infrastructure/sql/d1-sql-database.adapter.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import type { MockD1Client } from './mock-d1.js';

export function asSqlDatabase(client: D1Client | MockD1Client): ISqlDatabase {
  return new D1SqlDatabaseAdapter(client);
}

export function createTestMemoryRepository(client: D1Client | MockD1Client): MemoryRepository {
  return new MemoryRepository(asSqlDatabase(client));
}

export function createTestRelationRepository(
  client: D1Client | MockD1Client,
): MemoryRelationRepository {
  return new MemoryRelationRepository(asSqlDatabase(client));
}
