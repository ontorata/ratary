import type { ISqlDatabase } from '../../../src/ports/sql/isql-database.port.js';
import {
  migrateEnterprisePhase1,
  migrateIdentityFoundationPhase1,
} from '../../../src/db/migrations.js';

const IDENTITY_TEST_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  slug TEXT NOT NULL DEFAULT 'default',
  created_at TEXT NOT NULL,
  UNIQUE (owner_id, slug)
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  client_id TEXT,
  agent_type TEXT NOT NULL DEFAULT 'mcp',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspace_id);
`;

export async function setupIdentityTestDatabase(db: ISqlDatabase): Promise<void> {
  for (const statement of IDENTITY_TEST_SCHEMA_SQL.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.execute(statement);
  }

  await migrateEnterprisePhase1(db, 'sqlite');
  await migrateIdentityFoundationPhase1(db, 'sqlite');
}
