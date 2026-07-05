import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migrateEnterprisePhase2 } from '../../src/db/migrations.js';

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

describe('migrateEnterprisePhase2', () => {
  it('creates Phase 17 hierarchy and policy tables', async () => {
    const client = new RecordingD1Client();
    await migrateEnterprisePhase2(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS departments');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS tenant_projects');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS workspace_hierarchy_bindings');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS policy_bindings');
  });
});
