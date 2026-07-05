import { describe, it, expect, vi } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { D1SqlDatabaseAdapter } from '../../src/infrastructure/sql/d1-sql-database.adapter.js';
import { describeSqlDatabaseContract } from './contracts/isql-database.contract.js';

class SpyD1Client implements D1Client {
  query = vi.fn(async (): Promise<Record<string, unknown>[]> => [{ id: '1' }]);
  execute = vi.fn(async (): Promise<D1QueryResult> => ({
    results: [],
    success: true,
    meta: { changes: 2, last_row_id: 9, duration: 3 },
  }));
}

describe('D1SqlDatabaseAdapter', () => {
  it('should delegate query to underlying D1 client', async () => {
    const client = new SpyD1Client();
    const adapter = new D1SqlDatabaseAdapter(client);

    const rows = await adapter.query('SELECT 1', ['a']);
    expect(rows).toEqual([{ id: '1' }]);
    expect(client.query).toHaveBeenCalledWith('SELECT 1', ['a']);
  });

  it('should map execute meta fields to SqlExecuteResult', async () => {
    const client = new SpyD1Client();
    const adapter = new D1SqlDatabaseAdapter(client);

    const result = await adapter.execute('UPDATE memories SET title = ?', ['x']);
    expect(result.meta).toEqual({ changes: 2, lastRowId: 9, durationMs: 3 });
    expect(client.execute).toHaveBeenCalledWith('UPDATE memories SET title = ?', ['x']);
  });

  it('should expose unwrapD1Client for migration bootstrap', () => {
    const client = new SpyD1Client();
    const adapter = new D1SqlDatabaseAdapter(client);
    expect(adapter.unwrapD1Client()).toBe(client);
  });
});

describeSqlDatabaseContract('D1SqlDatabaseAdapter (spy client)', () => {
  const client = new SpyD1Client();
  client.query = vi.fn(async () => [{ value: 1 }]);
  client.execute = vi.fn(async () => ({
    results: [],
    success: true,
    meta: { changes: 0 },
  }));
  return new D1SqlDatabaseAdapter(client);
});
