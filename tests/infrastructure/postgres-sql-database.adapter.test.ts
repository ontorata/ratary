import { describe, it, expect, vi } from 'vitest';
import type { QueryResult } from 'pg';
import { PostgresSqlDatabaseAdapter } from '../../src/infrastructure/sql/postgres-sql-database.adapter.js';
import { describeSqlDatabaseContract } from './contracts/isql-database.contract.js';

function mockQueryResult(rows: Record<string, unknown>[], rowCount = rows.length): QueryResult {
  return {
    rows,
    rowCount,
    command: 'SELECT',
    oid: 0,
    fields: [],
  };
}

describe('PostgresSqlDatabaseAdapter', () => {
  it('should translate placeholders on query', async () => {
    const query = vi.fn(async (): Promise<QueryResult> => mockQueryResult([{ id: '1' }]));
    const adapter = new PostgresSqlDatabaseAdapter({ query });

    const rows = await adapter.query('SELECT id FROM memories WHERE owner_id = ?', ['owner-a']);

    expect(rows).toEqual([{ id: '1' }]);
    expect(query).toHaveBeenCalledWith('SELECT id FROM memories WHERE owner_id = $1', ['owner-a']);
  });

  it('should map rowCount to execute meta.changes', async () => {
    const query = vi.fn(async (): Promise<QueryResult> => mockQueryResult([], 3));
    const adapter = new PostgresSqlDatabaseAdapter({ query });

    const result = await adapter.execute('UPDATE memories SET title = ? WHERE id = ?', ['x', 'id-1']);

    expect(result.meta?.changes).toBe(3);
    expect(query).toHaveBeenCalledWith('UPDATE memories SET title = $1 WHERE id = $2', ['x', 'id-1']);
  });

  it('should expose unwrapPool', () => {
    const pool = { query: vi.fn() };
    const adapter = new PostgresSqlDatabaseAdapter(pool);
    expect(adapter.unwrapPool()).toBe(pool);
  });
});

describeSqlDatabaseContract('PostgresSqlDatabaseAdapter (mock pool)', () => {
  const query = vi.fn(async (): Promise<QueryResult> => mockQueryResult([{ value: 1 }]));
  return new PostgresSqlDatabaseAdapter({ query });
});
