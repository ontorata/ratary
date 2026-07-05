import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migrateContentScalePlatformPhase1 } from '../../src/db/migrations.js';

class RecordingD1Client implements D1Client {
  readonly statements: string[] = [];

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.execute(sql, params);
    return [] as T[];
  }

  async execute(sql: string, _params: unknown[] = []): Promise<D1QueryResult> {
    this.statements.push(sql.trim());
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('migrateContentScalePlatformPhase1', () => {
  it('creates Phase 22 content scale sync tables', async () => {
    const client = new RecordingD1Client();
    await migrateContentScalePlatformPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS content_scale_sync_runs');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS content_scale_sync_state');
  });
});
