import { describe, it, expect } from 'vitest';
import type { ISqlDatabase } from '../../../src/ports/sql/isql-database.port.js';

export function describeSqlDatabaseContract(
  label: string,
  createAdapter: () => ISqlDatabase | Promise<ISqlDatabase>,
): void {
  describe(`ISqlDatabase contract — ${label}`, () => {
    it('should return an array from query', async () => {
      const db = await createAdapter();
      const rows = await db.query('SELECT 1 AS value');
      expect(Array.isArray(rows)).toBe(true);
    });

    it('should return SqlExecuteResult shape from execute', async () => {
      const db = await createAdapter();
      const result = await db.execute('SELECT 1');
      expect(result).toHaveProperty('results');
      expect(Array.isArray(result.results)).toBe(true);
    });
  });
}
