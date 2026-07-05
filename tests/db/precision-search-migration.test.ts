import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migratePrecisionSearchPhase1 } from '../../src/db/migrations.js';

class RecordingD1Client implements D1Client {
  readonly statements: string[] = [];

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/PRAGMA table_info/i.test(sql)) {
      return [] as T[];
    }
    await this.execute(sql, params);
    return [] as T[];
  }

  async execute(sql: string, _params: unknown[] = []): Promise<D1QueryResult> {
    this.statements.push(sql.trim());
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('migratePrecisionSearchPhase1', () => {
  it('adds aliases and source_path columns plus unique index', async () => {
    const client = new RecordingD1Client();
    await migratePrecisionSearchPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain("ALTER TABLE memories ADD COLUMN aliases TEXT NOT NULL DEFAULT '[]'");
    expect(sql).toContain('ALTER TABLE memories ADD COLUMN source_path TEXT');
    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_source_path');
  });
});
