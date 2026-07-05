import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migrateEnterprisePhase1 } from '../../src/db/migrations.js';
import { MockD1Client } from '../helpers/mock-d1.js';

class RecordingD1Client implements D1Client {
  readonly statements: string[] = [];

  constructor(private readonly existingWorkspaceColumns: string[] = []) {}

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (/PRAGMA table_info\(workspaces\)/i.test(sql)) {
      return this.existingWorkspaceColumns.map((name) => ({ name })) as T[];
    }
    await this.execute(sql, params);
    return [] as T[];
  }

  async execute(sql: string, _params: unknown[] = []): Promise<D1QueryResult> {
    this.statements.push(sql.trim());
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('migrateEnterprisePhase1', () => {
  it('should create organizations and workspace_memberships tables', async () => {
    const client = new RecordingD1Client();

    await migrateEnterprisePhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS organizations');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS workspace_memberships');
    expect(sql).toContain('idx_organizations_owner');
    expect(sql).toContain('idx_workspace_memberships_workspace');
    expect(sql).toContain('idx_workspace_memberships_identity');
  });

  it('should add organization_id column to workspaces when missing', async () => {
    const client = new RecordingD1Client();

    await migrateEnterprisePhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('ALTER TABLE workspaces ADD COLUMN organization_id TEXT');
  });

  it('should skip organization_id ALTER when column already exists', async () => {
    const client = new RecordingD1Client(['organization_id']);

    await migrateEnterprisePhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).not.toContain('ALTER TABLE workspaces');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS organizations');
  });

  it('should not throw on MockD1Client', async () => {
    const mock = new MockD1Client();
    await expect(migrateEnterprisePhase1(mock)).resolves.toBeUndefined();
  });
});
