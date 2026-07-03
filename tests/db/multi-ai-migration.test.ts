import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migrateMultiAiPhase1 } from '../../src/db/migrations.js';
import { MockD1Client } from '../helpers/mock-d1.js';

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

describe('migrateMultiAiPhase1', () => {
  it('should create workspaces and agents tables with indexes', async () => {
    const client = new RecordingD1Client();

    await migrateMultiAiPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS workspaces');
    expect(sql).toContain('UNIQUE (owner_id, slug)');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS agents');
    expect(sql).toContain('FOREIGN KEY (workspace_id) REFERENCES workspaces(id)');
    expect(sql).toContain('idx_workspaces_owner');
    expect(sql).toContain('idx_agents_workspace');
    expect(sql).toContain('idx_agents_owner');
    expect(sql).toContain('idx_memories_workspace');
  });

  it('should add workspace columns to memories when missing', async () => {
    const client = new RecordingD1Client();

    await migrateMultiAiPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('ALTER TABLE memories ADD COLUMN workspace_id TEXT');
    expect(sql).toContain('ALTER TABLE memories ADD COLUMN last_modified_by_agent_id TEXT');
  });

  it('should skip ALTER when columns already exist (idempotent)', async () => {
    const client = new RecordingD1Client(['workspace_id', 'last_modified_by_agent_id']);

    await migrateMultiAiPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).not.toContain('ALTER TABLE memories');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS workspaces');
  });

  it('should not throw on MockD1Client', async () => {
    const mock = new MockD1Client();
    await expect(migrateMultiAiPhase1(mock)).resolves.toBeUndefined();
  });
});
