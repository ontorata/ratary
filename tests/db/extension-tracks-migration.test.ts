import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import {
  migrateExtensionTracksPhase1,
  migrateExtensionTracksPhase2,
  migrateExtensionTracksPhase3,
  migrateExtensionTracksPhase4,
  migrateExtensionTracksPhase5,
} from '../../src/db/migrations.js';

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

describe('migrateExtensionTracksPhase2', () => {
  it('creates learning_events and learning_policy_snapshots tables', async () => {
    const client = new RecordingD1Client();

    await migrateExtensionTracksPhase2(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS learning_events');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS learning_policy_snapshots');
    expect(sql).toContain('idx_learning_events_owner');
    expect(sql).toContain('idx_learning_snapshots_owner');
  });
});

describe('migrateExtensionTracksPhase3', () => {
  it('creates relation_inference_evidence table and index', async () => {
    const client = new RecordingD1Client();

    await migrateExtensionTracksPhase3(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS relation_inference_evidence');
    expect(sql).toContain('idx_relation_inference_evidence_owner');
  });
});

describe('migrateExtensionTracksPhase4', () => {
  it('creates memory_versions and memory_heads tables', async () => {
    const client = new RecordingD1Client();

    await migrateExtensionTracksPhase4(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memory_versions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memory_heads');
    expect(sql).toContain('idx_memory_versions_mem_ver');
  });
});

describe('migrateExtensionTracksPhase5', () => {
  it('creates sync_cursors and sync_conflicts tables', async () => {
    const client = new RecordingD1Client();

    await migrateExtensionTracksPhase5(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS sync_cursors');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS sync_conflicts');
    expect(sql).toContain('idx_sync_cursors_owner_platform');
    expect(sql).toContain('idx_sync_conflicts_owner_status');
  });
});
