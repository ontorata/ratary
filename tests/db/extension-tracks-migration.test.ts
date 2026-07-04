import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migrateExtensionTracksPhase1 } from '../../src/db/migrations.js';

class RecordingD1Client implements D1Client {
  readonly statements: string[] = [];

  constructor(private readonly existingColumns: string[] = []) {}

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/PRAGMA table_info/i.test(sql)) {
      return this.existingColumns.map((name) => ({ name })) as T[];
    }
    await this.execute(sql, params);
    return [] as T[];
  }

  async execute(sql: string, _params: unknown[] = []): Promise<D1QueryResult> {
    this.statements.push(sql.trim());
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('migrateExtensionTracksPhase1', () => {
  it('adds compression and lifecycle columns when missing', async () => {
    const client = new RecordingD1Client();

    await migrateExtensionTracksPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('ALTER TABLE memories ADD COLUMN compression_meta TEXT');
    expect(sql).toContain('ALTER TABLE memories ADD COLUMN compression_version INTEGER');
    expect(sql).toContain('ALTER TABLE memories ADD COLUMN lifecycle_state TEXT');
  });

  it('creates memory_signals table and index', async () => {
    const client = new RecordingD1Client();

    await migrateExtensionTracksPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memory_signals');
    expect(sql).toContain('idx_memory_signals_owner');
  });

  it('skips ALTER when columns already exist', async () => {
    const client = new RecordingD1Client([
      'compression_meta',
      'compression_version',
      'lifecycle_state',
    ]);

    await migrateExtensionTracksPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).not.toContain('ALTER TABLE memories');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memory_signals');
  });
});
