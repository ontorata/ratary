import { describe, expect, it } from 'vitest';
import {
  backfillMeilisearch,
  type MeilisearchIndexWriter,
  type MeilisearchMemoryDocument,
} from '../../scripts/lib/meilisearch-backfill.js';
import type { ISqlDatabase, SqlExecuteResult } from '../../src/ports/sql/isql-database.port.js';

class FakeMemorySql implements ISqlDatabase {
  constructor(private readonly rows: Record<string, unknown>[]) {}

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

describe('backfillMeilisearch', () => {
  it('should upsert documents on execute', async () => {
    const indexed: MeilisearchMemoryDocument[] = [];
    const writer: MeilisearchIndexWriter = {
      ensureIndex: async () => undefined,
      upsertDocuments: async (_index, documents) => {
        indexed.push(...documents);
      },
    };

    const source = new FakeMemorySql([
      {
        id: 'mem-1',
        owner_id: 'owner-a',
        workspace_id: 'ws-1',
        project_id: 'demo',
        title: 'Title',
        content: 'Body',
        summary: 'Summary',
        tags: '["tag-a"]',
      },
    ]);

    const result = await backfillMeilisearch({
      source,
      writer,
      index: 'memories',
      ownerId: 'owner-a',
      batchSize: 10,
      dryRun: false,
    });

    expect(result.indexed).toBe(1);
    expect(indexed[0]?.id).toBe('mem-1');
    expect(indexed[0]?.tags).toEqual(['tag-a']);
  });
});
