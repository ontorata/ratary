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
  owner_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON clients(owner_id);
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

const KNOWLEDGE_MEMORY_COLUMNS: Array<{ name: string; ddl: string }> = [
  { name: 'codename', ddl: 'ALTER TABLE memories ADD COLUMN codename TEXT' },
  { name: 'slug', ddl: 'ALTER TABLE memories ADD COLUMN slug TEXT' },
  { name: 'keywords', ddl: "ALTER TABLE memories ADD COLUMN keywords TEXT NOT NULL DEFAULT '[]'" },
  { name: 'category', ddl: "ALTER TABLE memories ADD COLUMN category TEXT NOT NULL DEFAULT ''" },
  {
    name: 'memory_type',
    ddl: "ALTER TABLE memories ADD COLUMN memory_type TEXT NOT NULL DEFAULT 'note'",
  },
  {
    name: 'importance',
    ddl: 'ALTER TABLE memories ADD COLUMN importance INTEGER NOT NULL DEFAULT 50',
  },
  { name: 'language', ddl: "ALTER TABLE memories ADD COLUMN language TEXT NOT NULL DEFAULT 'id'" },
  { name: 'notes', ddl: "ALTER TABLE memories ADD COLUMN notes TEXT NOT NULL DEFAULT ''" },
];

const MEMORY_RELATIONS_SQL = `
CREATE TABLE IF NOT EXISTS memory_relations (
  id TEXT PRIMARY KEY,
  source_memory_id TEXT NOT NULL,
  target_memory_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  owner_id TEXT NOT NULL DEFAULT '',
  weight REAL NOT NULL DEFAULT 1.0,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_by TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  FOREIGN KEY (target_memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_relations_unique
  ON memory_relations(source_memory_id, target_memory_id, relation);

CREATE INDEX IF NOT EXISTS idx_relations_source ON memory_relations(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON memory_relations(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_relations_owner ON memory_relations(owner_id);
`;

function splitStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function tableHasColumn(client: D1Client, table: string, column: string): Promise<boolean> {
  const rows = await client.query<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

async function migrateMemoriesOwnerId(client: D1Client): Promise<void> {
  const hasOwnerId = await tableHasColumn(client, 'memories', 'owner_id');
  if (!hasOwnerId) {
    await client.execute(`ALTER TABLE memories ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''`);
  }

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_memories_owner_id ON memories(owner_id)`);
}

async function migrateClientsOwnerId(client: D1Client): Promise<void> {
  const hasOwnerId = await tableHasColumn(client, 'clients', 'owner_id');
  if (!hasOwnerId) {
    await client.execute(`ALTER TABLE clients ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''`);
  }

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON clients(owner_id)`);
}

/** Phase 2.6 M1a — knowledge columns + relations table (no unique indexes yet). */
export async function migrateKnowledgeFoundationPhase1(client: D1Client): Promise<void> {
  for (const column of KNOWLEDGE_MEMORY_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }

  for (const sql of splitStatements(MEMORY_RELATIONS_SQL)) {
    await client.execute(sql);
  }

  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_owner_category ON memories(owner_id, category)`,
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_memory_type ON memories(memory_type)`,
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance)`,
  );
}

const MEMORY_INTELLIGENCE_COLUMNS: Array<{ name: string; ddl: string }> = [
  { name: 'project_id', ddl: "ALTER TABLE memories ADD COLUMN project_id TEXT NOT NULL DEFAULT ''" },
  { name: 'level', ddl: "ALTER TABLE memories ADD COLUMN level TEXT NOT NULL DEFAULT 'note'" },
  { name: 'last_accessed', ddl: 'ALTER TABLE memories ADD COLUMN last_accessed TEXT' },
  {
    name: 'access_count',
    ddl: 'ALTER TABLE memories ADD COLUMN access_count INTEGER NOT NULL DEFAULT 0',
  },
  { name: 'embedding_id', ddl: 'ALTER TABLE memories ADD COLUMN embedding_id TEXT' },
  { name: 'object_key', ddl: 'ALTER TABLE memories ADD COLUMN object_key TEXT' },
  { name: 'semantic_hash', ddl: 'ALTER TABLE memories ADD COLUMN semantic_hash TEXT' },
];

/** Phase 4 M4a — intelligence columns (indexes in M4c). */
export async function migrateMemoryIntelligencePhase1(client: D1Client): Promise<void> {
  for (const column of MEMORY_INTELLIGENCE_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }
}

/** Phase 2.6 M3 — unique indexes after backfill. */
export async function migrateKnowledgeFoundationPhase3(client: D1Client): Promise<void> {
  await client.execute(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_codename
     ON memories(owner_id, codename) WHERE codename IS NOT NULL`,
  );
  await client.execute(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_slug
     ON memories(owner_id, slug) WHERE slug IS NOT NULL`,
  );
}

export async function runMigrations(client: D1Client = getD1Client()): Promise<void> {
  const statements = splitStatements(MIGRATION_SQL);
  const createTables = statements.filter((sql) => /^\s*CREATE\s+TABLE/i.test(sql));
  const createIndexes = statements.filter((sql) => !/^\s*CREATE\s+TABLE/i.test(sql));

  for (const sql of createTables) {
    await client.execute(sql);
  }

  await migrateMemoriesOwnerId(client);
  await migrateClientsOwnerId(client);

  for (const sql of createIndexes) {
    await client.execute(sql);
  }

  await migrateKnowledgeFoundationPhase1(client);
  await migrateKnowledgeFoundationPhase3(client);
  await migrateMemoryIntelligencePhase1(client);
}

export interface D1Statement {
  sql: string;
  params?: unknown[];
}

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
