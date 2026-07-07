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

CREATE TABLE IF NOT EXISTS auth_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  owner_id TEXT NOT NULL,
  identity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (identity_id) REFERENCES identities(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_accounts_email ON auth_accounts(email);

CREATE INDEX IF NOT EXISTS idx_auth_accounts_owner_id ON auth_accounts(owner_id);

CREATE TABLE IF NOT EXISTS auth_login_attempts (
  email TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_attempt_at TEXT NOT NULL,
  last_ip TEXT
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

/** Phase 17 — enterprise security hierarchy + policy bindings (ADR-032). */
const ENTERPRISE_SECURITY_V2_SQL = `
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (organization_id, slug),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS tenant_projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  department_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (department_id, slug),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS workspace_hierarchy_bindings (
  workspace_id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  department_id TEXT,
  tenant_project_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (tenant_project_id) REFERENCES tenant_projects(id)
);

CREATE TABLE IF NOT EXISTS policy_bindings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  policy_package TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT 'allow',
  resource_pattern TEXT NOT NULL DEFAULT '*',
  created_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_projects_dept ON tenant_projects(department_id);
CREATE INDEX IF NOT EXISTS idx_policy_bindings_org ON policy_bindings(organization_id);
`;

export async function migrateEnterprisePhase2(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(ENTERPRISE_SECURITY_V2_SQL)) {
    await client.execute(sql);
  }
}

/** Cloud platform metadata (Phase 18) — ADR-033. */
const CLOUD_PLATFORM_SQL = `
CREATE TABLE IF NOT EXISTS cloud_regions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  cloud_provider TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cloud_tenant_metadata (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  department_id TEXT,
  tenant_project_id TEXT,
  primary_region_id TEXT NOT NULL,
  secondary_region_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(organization_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_cloud_tenant_metadata_org ON cloud_tenant_metadata(organization_id);

CREATE TABLE IF NOT EXISTS cloud_workspace_regions (
  workspace_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  primary_region_id TEXT NOT NULL,
  secondary_region_id TEXT,
  read_preference TEXT NOT NULL DEFAULT 'primary',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cloud_usage_records (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  organization_id TEXT,
  metric_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  occurred_at TEXT NOT NULL,
  correlation_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_cloud_usage_owner ON cloud_usage_records(owner_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS cloud_dr_schedules (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  cron_expression TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cloud_dr_schedules_owner ON cloud_dr_schedules(owner_id, workspace_id);
`;

export async function migrateCloudPlatformPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(CLOUD_PLATFORM_SQL)) {
    await client.execute(sql);
  }
}

/** AI infrastructure platform (Phase 20) — ADR-035. */
const INFRASTRUCTURE_PLATFORM_SQL = `
CREATE TABLE IF NOT EXISTS plugin_registry (
  id TEXT PRIMARY KEY,
  plugin_type TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  registered_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  enabled_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_plugin_registry_type ON plugin_registry(plugin_type, status);

CREATE TABLE IF NOT EXISTS plugin_allow_list (
  organization_id TEXT NOT NULL,
  plugin_id TEXT NOT NULL,
  allowed INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, plugin_id)
);
`;

export async function migrateInfrastructurePlatformPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(INFRASTRUCTURE_PLATFORM_SQL)) {
    await client.execute(sql);
  }
}

/** Search & graph production platform (Phase 21) — ADR-022. */
const SEARCH_GRAPH_PLATFORM_SQL = `
CREATE TABLE IF NOT EXISTS search_graph_sync_runs (
  id TEXT PRIMARY KEY,
  target TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT,
  stats_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_search_graph_sync_runs_target ON search_graph_sync_runs(target, started_at DESC);

CREATE TABLE IF NOT EXISTS search_graph_sync_state (
  target TEXT PRIMARY KEY,
  last_watermark TEXT NOT NULL,
  last_run_id TEXT,
  updated_at TEXT NOT NULL
);
`;

export async function migrateSearchGraphPlatformPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(SEARCH_GRAPH_PLATFORM_SQL)) {
    await client.execute(sql);
  }
}

/** Content & vector scale platform (Phase 22) — ADR-021. */
const CONTENT_SCALE_PLATFORM_SQL = `
CREATE TABLE IF NOT EXISTS content_scale_sync_runs (
  id TEXT PRIMARY KEY,
  target TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT,
  stats_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_content_scale_sync_runs_target ON content_scale_sync_runs(target, started_at DESC);

CREATE TABLE IF NOT EXISTS content_scale_sync_state (
  target TEXT PRIMARY KEY,
  last_watermark TEXT NOT NULL,
  last_run_id TEXT,
  updated_at TEXT NOT NULL
);
`;

export async function migrateContentScalePlatformPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(CONTENT_SCALE_PLATFORM_SQL)) {
    await client.execute(sql);
  }
}

/** Enterprise knowledge fabric (Phase 23) — ADR-047. */
const KNOWLEDGE_FABRIC_PLATFORM_SQL = `
CREATE TABLE IF NOT EXISTS knowledge_fabric_ingest_runs (
  id TEXT PRIMARY KEY,
  connector_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT,
  workspace_id TEXT,
  stats_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_knowledge_fabric_ingest_runs_connector ON knowledge_fabric_ingest_runs(connector_id, started_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_fabric_connector_state (
  connector_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  last_cursor TEXT NOT NULL,
  last_run_id TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (connector_id, owner_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS knowledge_fabric_external_refs (
  id TEXT PRIMARY KEY,
  connector_id TEXT NOT NULL,
  external_id TEXT NOT NULL,
  memory_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  external_updated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(connector_id, external_id, owner_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_fabric_external_refs_memory ON knowledge_fabric_external_refs(memory_id);
`;

/** Universal memory fabric provenance index (Phase 32). */
const UNIVERSAL_MEMORY_FABRIC_SQL = `
CREATE TABLE IF NOT EXISTS knowledge_fabric_provenance (
  id TEXT PRIMARY KEY,
  source_kind TEXT NOT NULL,
  source_id TEXT NOT NULL,
  external_id TEXT NOT NULL,
  memory_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  external_updated_at TEXT NOT NULL,
  metadata_json TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(source_kind, source_id, external_id, owner_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_fabric_provenance_memory ON knowledge_fabric_provenance(memory_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_fabric_provenance_owner ON knowledge_fabric_provenance(owner_id, updated_at DESC);
`;

export async function migrateKnowledgeFabricPlatformPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(KNOWLEDGE_FABRIC_PLATFORM_SQL)) {
    await client.execute(sql);
  }
}

export async function migrateUniversalMemoryFabricPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(UNIVERSAL_MEMORY_FABRIC_SQL)) {
    await client.execute(sql);
  }
}

/** Ratary platform umbrella (Phase 24) — ADR-044. */
const AI_BRAIN_PLATFORM_SQL = `
CREATE TABLE IF NOT EXISTS platform_webhook_subscriptions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  url TEXT NOT NULL,
  secret TEXT,
  topics_json TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_webhook_subscriptions_owner ON platform_webhook_subscriptions(owner_id, workspace_id);
`;

export async function migrateAiBrainPlatformPhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(AI_BRAIN_PLATFORM_SQL)) {
    await client.execute(sql);
  }
}

const GLOBAL_INTELLIGENCE_SQL = `
CREATE TABLE IF NOT EXISTS intelligence_telemetry_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  node_id TEXT NOT NULL,
  envelope_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intelligence_telemetry_owner ON intelligence_telemetry_events(owner_id, workspace_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_telemetry_type ON intelligence_telemetry_events(event_type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS intelligence_sync_state (
  scope_key TEXT PRIMARY KEY,
  tier TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  last_cursor TEXT,
  last_run_id TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intelligence_sync_owner ON intelligence_sync_state(owner_id, workspace_id);

CREATE TABLE IF NOT EXISTS intelligence_offline_journal (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  entry_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  applied_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_intelligence_offline_journal_owner ON intelligence_offline_journal(owner_id, workspace_id, status);
`;

export async function migrateGlobalIntelligencePhase1(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(GLOBAL_INTELLIGENCE_SQL)) {
    await client.execute(sql);
  }
}

/** Extension tracks 5.5 / 8.5 — compression metadata + quality signals (ADR-023, ADR-026). */
const EXTENSION_TRACK_MEMORY_COLUMNS: Array<{ name: string; ddl: string }> = [
  { name: 'compression_meta', ddl: 'ALTER TABLE memories ADD COLUMN compression_meta TEXT' },
  {
    name: 'compression_version',
    ddl: 'ALTER TABLE memories ADD COLUMN compression_version INTEGER',
  },
  { name: 'lifecycle_state', ddl: 'ALTER TABLE memories ADD COLUMN lifecycle_state TEXT' },
];

const MEMORY_SIGNALS_SQL = `
CREATE TABLE IF NOT EXISTS memory_signals (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  memory_id TEXT,
  signal_type TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_signals_owner ON memory_signals(owner_id, created_at DESC);
`;

const LEARNING_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS learning_events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  processed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_events_owner ON learning_events(owner_id, processed, created_at);

CREATE TABLE IF NOT EXISTS learning_policy_snapshots (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  snapshot_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_snapshots_owner ON learning_policy_snapshots(owner_id, snapshot_type, active);
`;

const RELATION_INFERENCE_EVIDENCE_SQL = `
CREATE TABLE IF NOT EXISTS relation_inference_evidence (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  source_memory_id TEXT NOT NULL,
  target_memory_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  inference_source TEXT NOT NULL,
  confidence REAL NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_relation_inference_evidence_owner
  ON relation_inference_evidence(owner_id, created_at DESC);
`;

const MEMORY_EVOLUTION_SQL = `
CREATE TABLE IF NOT EXISTS memory_versions (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot TEXT NOT NULL,
  created_by TEXT,
  merge_parent_ids TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_versions_mem_ver
  ON memory_versions(memory_id, version_number);

CREATE TABLE IF NOT EXISTS memory_heads (
  memory_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  current_version INTEGER NOT NULL DEFAULT 0,
  branch_name TEXT NOT NULL DEFAULT 'main',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_heads_owner ON memory_heads(owner_id);
`;

const MULTI_CLIENT_SYNC_SQL = `
CREATE TABLE IF NOT EXISTS sync_cursors (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  platform_id TEXT NOT NULL,
  cursor_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_cursors_owner_platform
  ON sync_cursors(owner_id, platform_id, workspace_id);

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  platform_id TEXT NOT NULL,
  memory_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_owner_status
  ON sync_conflicts(owner_id, status);
`;

const FEDERATION_SQL = `
CREATE TABLE IF NOT EXISTS federation_sync_cursors (
  id TEXT PRIMARY KEY,
  peer_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  cursor_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_federation_sync_cursors_peer_scope
  ON federation_sync_cursors(peer_id, owner_id, workspace_id);

CREATE TABLE IF NOT EXISTS federation_peers (
  peer_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '',
  trusted INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (peer_id, organization_id)
);

CREATE TABLE IF NOT EXISTS federation_exchange_log (
  id TEXT PRIMARY KEY,
  peer_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  accepted INTEGER NOT NULL DEFAULT 0,
  rejected INTEGER NOT NULL DEFAULT 0,
  bundle_id TEXT,
  cursor_value TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_federation_exchange_log_peer
  ON federation_exchange_log(peer_id, created_at);
`;

export async function migrateExtensionTracksPhase1(
  client: ISqlDatabase,
  dialect: MigrationDialect = 'sqlite',
): Promise<void> {
  for (const column of EXTENSION_TRACK_MEMORY_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name, dialect);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }

  for (const sql of splitStatements(MEMORY_SIGNALS_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 8.6 — learning events + policy snapshots (ADR-057). */
export async function migrateExtensionTracksPhase2(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(LEARNING_TABLES_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 8.7 — relation inference evidence (ADR-041). */
export async function migrateExtensionTracksPhase3(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(RELATION_INFERENCE_EVIDENCE_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 09.7 — memory evolution version store (ADR-040). */
export async function migrateExtensionTracksPhase4(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(MEMORY_EVOLUTION_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 09.8 — multi-client sync cursors and conflict queue (ADR-042). */
export async function migrateExtensionTracksPhase5(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(MULTI_CLIENT_SYNC_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 14 — federation metadata (ADR-029). */
export async function migrateExtensionTracksPhase6(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(FEDERATION_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 04.7 — stewardship run history (ADR-045). */
const STEWARDSHIP_RUNS_SQL = `
CREATE TABLE IF NOT EXISTS stewardship_runs (
  run_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  project_id TEXT,
  dry_run INTEGER NOT NULL DEFAULT 1,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  report_json TEXT NOT NULL,
  had_errors INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stewardship_runs_owner ON stewardship_runs(owner_id, started_at DESC);
`;

export async function migrateExtensionTracksPhase7(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(STEWARDSHIP_RUNS_SQL)) {
    await client.execute(sql);
  }
}

/** Extension track 8.8 — inspection pattern ledger (ADR-059). */
const INSPECTION_LEDGER_SQL = `
CREATE TABLE IF NOT EXISTS inspection_patterns (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  organization_id TEXT,
  memory_id TEXT,
  pattern_key TEXT NOT NULL,
  pattern_scope TEXT NOT NULL,
  category TEXT NOT NULL,
  trigger_json TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  protected INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  lifecycle_state TEXT NOT NULL DEFAULT 'active',
  last_confirmed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspection_patterns_owner ON inspection_patterns(owner_id, lifecycle_state);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inspection_patterns_scope_key ON inspection_patterns(
  owner_id, pattern_scope, pattern_key, workspace_id
);

CREATE TABLE IF NOT EXISTS inspection_pattern_events (
  id TEXT PRIMARY KEY,
  pattern_id TEXT NOT NULL,
  signal_id TEXT NOT NULL,
  observed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspection_pattern_events_pattern ON inspection_pattern_events(pattern_id);

CREATE TABLE IF NOT EXISTS inspection_pattern_contradictions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  pattern_id_a TEXT NOT NULL,
  pattern_id_b TEXT NOT NULL,
  reason TEXT NOT NULL,
  detected_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspection_contradictions_owner ON inspection_pattern_contradictions(owner_id);
`;

export async function migrateExtensionTracksPhase8(client: ISqlDatabase): Promise<void> {
  for (const sql of splitStatements(INSPECTION_LEDGER_SQL)) {
    await client.execute(sql);
  }
}

const PRECISION_SEARCH_MEMORY_COLUMNS: Array<{ name: string; ddl: string }> = [
  { name: 'aliases', ddl: "ALTER TABLE memories ADD COLUMN aliases TEXT NOT NULL DEFAULT '[]'" },
  { name: 'source_path', ddl: 'ALTER TABLE memories ADD COLUMN source_path TEXT' },
];

/** Phase 6.6A — precision search columns + source_path uniqueness (ADR-060). */
export async function migratePrecisionSearchPhase1(
  client: ISqlDatabase,
  dialect: MigrationDialect = 'sqlite',
): Promise<void> {
  for (const column of PRECISION_SEARCH_MEMORY_COLUMNS) {
    const hasColumn = await tableHasColumn(client, 'memories', column.name, dialect);
    if (!hasColumn) {
      await client.execute(column.ddl);
    }
  }

  await client.execute(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_source_path
     ON memories(owner_id, source_path) WHERE source_path IS NOT NULL`,
  );
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
  await migrateEnterprisePhase2(client);
  await migrateCloudPlatformPhase1(client);
  await migrateInfrastructurePlatformPhase1(client);
  await migrateSearchGraphPlatformPhase1(client);
  await migrateContentScalePlatformPhase1(client);
  await migrateKnowledgeFabricPlatformPhase1(client);
  await migrateUniversalMemoryFabricPhase1(client);
  await migrateAiBrainPlatformPhase1(client);
  await migrateGlobalIntelligencePhase1(client);
  await migrateExtensionTracksPhase1(client, dialect);
  await migrateExtensionTracksPhase2(client);
  await migrateExtensionTracksPhase3(client);
  await migrateExtensionTracksPhase4(client);
  await migrateExtensionTracksPhase5(client);
  await migrateExtensionTracksPhase6(client);
  await migrateExtensionTracksPhase7(client);
  await migrateExtensionTracksPhase8(client);
  await migratePrecisionSearchPhase1(client, dialect);
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

  const useSqlTransaction = process.env.SQL_PROVIDER !== 'd1';

  if (!useSqlTransaction) {
    for (const { sql, params } of statements) {
      await client.execute(sql, params ?? []);
    }
    return;
  }

  await client.execute('BEGIN');
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
