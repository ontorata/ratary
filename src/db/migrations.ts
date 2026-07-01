import { getD1Client, type D1Client } from './d1-client.js';

/**
 * Canonical migration SQL — kept in sync with schema.sql at repo root.
 * Statements are split and run idempotently via runMigrations().
 */
export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  favorite INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  owner_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project);
CREATE INDEX IF NOT EXISTS idx_memories_favorite ON memories(favorite);
CREATE INDEX IF NOT EXISTS idx_memories_archived ON memories(archived);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);

CREATE TABLE IF NOT EXISTS identities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  secret_hash TEXT,
  owner_id TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  client_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  expires_at TEXT,
  revoked_at TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_identities_secret_hash
  ON identities(secret_hash)
  WHERE secret_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_identities_owner_id ON identities(owner_id);
CREATE INDEX IF NOT EXISTS idx_identities_type ON identities(type);
CREATE INDEX IF NOT EXISTS idx_identities_client_id ON identities(client_id);
CREATE INDEX IF NOT EXISTS idx_identities_active ON identities(active);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(active);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  identity_id TEXT,
  owner_id TEXT,
  client_id TEXT,
  resource TEXT,
  resource_id TEXT,
  request_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_identity_id ON audit_logs(identity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_owner_id ON audit_logs(owner_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

function splitStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function tableHasColumn(
  client: D1Client,
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await client.query<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

/**
 * Add owner_id to memories when upgrading an existing database
 * created before Phase 2 identity layer.
 */
async function migrateMemoriesOwnerId(client: D1Client): Promise<void> {
  const hasOwnerId = await tableHasColumn(client, 'memories', 'owner_id');
  if (!hasOwnerId) {
    await client.execute(
      `ALTER TABLE memories ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''`,
    );
  }

  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_owner_id ON memories(owner_id)`,
  );
}

export async function runMigrations(client: D1Client = getD1Client()): Promise<void> {
  for (const sql of splitStatements(MIGRATION_SQL)) {
    await client.execute(sql);
  }

  await migrateMemoriesOwnerId(client);
}

export interface D1Statement {
  sql: string;
  params?: unknown[];
}

/**
 * Run multiple statements in a single SQLite transaction.
 * Used by bootstrap to atomically create the first identity + client + settings lock.
 */
export async function executeTransaction(
  client: D1Client,
  statements: D1Statement[],
): Promise<void> {
  if (statements.length === 0) return;

  await client.execute('BEGIN IMMEDIATE');
  try {
    for (const { sql, params } of statements) {
      await client.execute(sql, params ?? []);
    }
    await client.execute('COMMIT');
  } catch (error) {
    try {
      await client.execute('ROLLBACK');
    } catch {
      // ignore rollback failure
    }
    throw error;
  }
}
