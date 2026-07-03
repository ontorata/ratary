import { getD1Client, type D1Client } from './d1-client.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';

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

const MEMORY_EMBEDDINGS_SQL = `
CREATE TABLE IF NOT EXISTS memory_embeddings (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  vector_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_embeddings_owner_memory
  ON memory_embeddings (owner_id, memory_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_embeddings_memory_model
  ON memory_embeddings (memory_id, model_id);
`;

export type MigrationDialect = 'sqlite' | 'postgres';

export function splitStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function assertSqlIdentifier(name: string): void {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Invalid SQL identifier: ${name}`);
  }
}

async function tableHasColumn(
  client: ISqlDatabase,
  table: string,
  column: string,
  dialect: MigrationDialect,
): Promise<boolean> {
  assertSqlIdentifier(table);
  assertSqlIdentifier(column);

  if (dialect === 'postgres') {
    const rows = await client.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
       LIMIT 1`,
      [table, column],
    );
    return rows.length > 0;
  }

  const rows = await client.query<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

async function migrateMemoriesOwnerId(
  client: ISqlDatabase,
  dialect: MigrationDialect,
): Promise<void> {
  const hasOwnerId = await tableHasColumn(client, 'memories', 'owner_id', dialect);
  if (!hasOwnerId) {
    await client.execute(`ALTER TABLE memories ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''`);
  }

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_memories_owner_id ON memories(owner_id)`);
}

async function migrateClientsOwnerId(
  client: ISqlDatabase,
  dialect: MigrationDialect,
): Promise<void> {
  const hasOwnerId = await tableHasColumn(client, 'clients', 'owner_id', dialect);
  if (!hasOwnerId) {
    await client.execute(`ALTER TABLE clients ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''`);
  }

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON clients(owner_id)`);
}

/** Phase 2.6 M1a — knowledge columns + relations table (no unique indexes yet). */
export async function migrateKnowledgeFoundationPhase1(
  client: ISqlDatabase,
  dialect: MigrationDialect = 'sqlite',
): Promise<void> {
  for (const column of KNOWLEDGE_MEMORY_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name, dialect);
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
  {
    name: 'project_id',
    ddl: "ALTER TABLE memories ADD COLUMN project_id TEXT NOT NULL DEFAULT ''",
  },
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
export async function migrateMemoryIntelligencePhase1(
  client: ISqlDatabase,
  dialect: MigrationDialect = 'sqlite',
): Promise<void> {
  for (const column of MEMORY_INTELLIGENCE_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name, dialect);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }
}

/** Phase 4 M4c — retrieval indexes after backfill. */
export async function migrateMemoryIntelligencePhase3(client: ISqlDatabase): Promise<void> {
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(owner_id, project_id)`,
  );
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_memories_level ON memories(level)`);
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_last_accessed ON memories(last_accessed)`,
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_retrieval
     ON memories(owner_id, project_id, archived, importance DESC, updated_at DESC)`,
  );
}

/** Phase 5 M5a/b — embedding vector storage table and indexes. */
export async function migrateEmbeddingPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(MEMORY_EMBEDDINGS_SQL)) {
    await client.execute(sql);
  }
}

const WORKSPACES_AGENTS_SQL = `
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
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id);
`;

const MULTI_AI_MEMORY_COLUMNS: Array<{ name: string; ddl: string }> = [
  { name: 'workspace_id', ddl: 'ALTER TABLE memories ADD COLUMN workspace_id TEXT' },
  {
    name: 'last_modified_by_agent_id',
    ddl: 'ALTER TABLE memories ADD COLUMN last_modified_by_agent_id TEXT',
  },
];

/** Phase 9 M9a — workspaces/agents tables + memories workspace columns (ADR-007). */
export async function migrateMultiAiPhase1(
  client: ISqlDatabase,
  dialect: MigrationDialect = 'sqlite',
): Promise<void> {
  for (const sql of splitStatements(WORKSPACES_AGENTS_SQL)) {
    await client.execute(sql);
  }

  for (const column of MULTI_AI_MEMORY_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name, dialect);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }

  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_memories_workspace ON memories(workspace_id)`,
  );
}

const ENTERPRISE_ORG_SQL = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT 'default',
  created_at TEXT NOT NULL,
  UNIQUE (owner_id, slug)
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  identity_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (organization_id, workspace_id, identity_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_identity ON workspace_memberships(identity_id);
`;

const ENTERPRISE_WORKSPACE_COLUMNS: Array<{ name: string; ddl: string }> = [
  {
    name: 'organization_id',
    ddl: 'ALTER TABLE workspaces ADD COLUMN organization_id TEXT',
  },
];

/** Phase 10 M10a — organizations, workspace memberships (ADR-002 / ADR-010). */
export async function migrateEnterprisePhase1(
  client: ISqlDatabase,
  dialect: MigrationDialect = 'sqlite',
): Promise<void> {
  for (const sql of splitStatements(ENTERPRISE_ORG_SQL)) {
    await client.execute(sql);
  }

  for (const column of ENTERPRISE_WORKSPACE_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'workspaces', column.name, dialect);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }
}

/** Phase 2.6 M3 — unique indexes after backfill. */
export async function migrateKnowledgeFoundationPhase3(client: ISqlDatabase): Promise<void> {
  await client.execute(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_codename
     ON memories(owner_id, codename) WHERE codename IS NOT NULL`,
  );
  await client.execute(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_slug
     ON memories(owner_id, slug) WHERE slug IS NOT NULL`,
  );
}

/**
 * Apply canonical schema migrations via ISqlDatabase (D1 or Postgres adapter).
 * @see runPostgresMigrations in postgres-migrations.ts for Postgres entry point
 */
export async function runSchemaMigrations(
  client: ISqlDatabase,
  dialect: MigrationDialect,
): Promise<void> {
  const statements = splitStatements(MIGRATION_SQL);
  const createTables = statements.filter((sql) => /^\s*CREATE\s+TABLE/i.test(sql));
  const createIndexes = statements.filter((sql) => !/^\s*CREATE\s+TABLE/i.test(sql));

  for (const sql of createTables) {
    await client.execute(sql);
  }

  await migrateMemoriesOwnerId(client, dialect);
  await migrateClientsOwnerId(client, dialect);

  for (const sql of createIndexes) {
    await client.execute(sql);
  }

  await migrateKnowledgeFoundationPhase1(client, dialect);
  await migrateKnowledgeFoundationPhase3(client);
  await migrateMemoryIntelligencePhase1(client, dialect);
  await migrateMemoryIntelligencePhase3(client);
  await migrateEmbeddingPhase1(client);
  await migrateMultiAiPhase1(client, dialect);
  await migrateEnterprisePhase1(client, dialect);
}

export async function runMigrations(client: D1Client = getD1Client()): Promise<void> {
  await runSchemaMigrations(client, 'sqlite');
}

export interface D1Statement {
  sql: string;
  params?: unknown[];
}

export async function executeTransaction(
  client: ISqlDatabase,
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
