import { describe, expect, it } from 'vitest';
import {
  backfillNeo4j,
  type Neo4jGraphWriter,
  type Neo4jRelationRow,
} from '../../scripts/lib/neo4j-backfill.js';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';

class FakeRelationSql implements ISqlDatabase {
  constructor(private readonly rows: Neo4jRelationRow[]) {}

  async query<T>(sql: string, params?: readonly unknown[]): Promise<T[]> {
    if (sql.includes('DISTINCT owner_id')) {
      return [{ owner_id: 'owner-a' }] as T[];
    }
    const ownerId = params?.[0];
    return this.rows.filter((row) => row.owner_id === ownerId) as T[];
  }

  async execute(): Promise<SqlExecuteResult> {
    return { results: [], meta: { changes: 0 } };
  }
}

describe('backfillNeo4j', () => {
  it('should merge relations on execute', async () => {
    const merged: Neo4jRelationRow[] = [];
    const writer: Neo4jGraphWriter = {
      ensureSchema: async () => undefined,
      mergeRelation: async (row) => {
        merged.push(row);
      },
    };

    const source = new FakeRelationSql([
      {
        source_memory_id: 'mem-1',
        target_memory_id: 'mem-2',
        relation: 'depends_on',
        owner_id: 'owner-a',
      },
    ]);

    const result = await backfillNeo4j({
      source,
      writer,
      ownerId: 'owner-a',
      batchSize: 10,
      dryRun: false,
    });

    expect(result.merged).toBe(1);
    expect(merged[0]?.target_memory_id).toBe('mem-2');
  });
});
