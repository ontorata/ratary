-- memories (existing + knowledge foundation Phase 2.6)
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
  codename TEXT,
  slug TEXT,
  keywords TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT '',
  memory_type TEXT NOT NULL DEFAULT 'note',
  importance INTEGER NOT NULL DEFAULT 50,
  language TEXT NOT NULL DEFAULT 'id',
  notes TEXT NOT NULL DEFAULT '',
  project_id TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'note',
  last_accessed TEXT,
  access_count INTEGER NOT NULL DEFAULT 0,
  embedding_id TEXT,
  object_key TEXT,
  semantic_hash TEXT,
  aliases TEXT NOT NULL DEFAULT '[]',
  source_path TEXT,
  workspace_id TEXT,
  last_modified_by_agent_id TEXT,
  compression_meta TEXT,
  compression_version INTEGER,
  lifecycle_state TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project);
CREATE INDEX IF NOT EXISTS idx_memories_favorite ON memories(favorite);
CREATE INDEX IF NOT EXISTS idx_memories_archived ON memories(archived);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memories_owner_id ON memories(owner_id);
CREATE INDEX IF NOT EXISTS idx_memories_owner_category ON memories(owner_id, category);
CREATE INDEX IF NOT EXISTS idx_memories_memory_type ON memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance);

-- Phase 4 intelligence indexes
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(owner_id, project_id);
CREATE INDEX IF NOT EXISTS idx_memories_level ON memories(level);
CREATE INDEX IF NOT EXISTS idx_memories_last_accessed ON memories(last_accessed);
CREATE INDEX IF NOT EXISTS idx_memories_retrieval
  ON memories(owner_id, project_id, archived, importance DESC, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_codename
  ON memories(owner_id, codename) WHERE codename IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_slug
  ON memories(owner_id, slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_source_path
  ON memories(owner_id, source_path) WHERE source_path IS NOT NULL;

-- Phase 9 multi-AI index (ADR-007)
CREATE INDEX IF NOT EXISTS idx_memories_workspace ON memories(workspace_id);

-- workspaces: shared brain boundary per owner (Phase 9, ADR-007)
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  slug TEXT NOT NULL DEFAULT 'default',
  created_at TEXT NOT NULL,
  organization_id TEXT,
  UNIQUE (owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);

-- organizations: enterprise tenant boundary (Phase 10, ADR-002 / ADR-010)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT 'default',
  created_at TEXT NOT NULL,
  UNIQUE (owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- workspace_memberships: RBAC binding identity to workspace (Phase 10, ADR-010)
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

CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_identity ON workspace_memberships(identity_id);

-- agents: AI client identity inside a workspace (Phase 9, ADR-007)
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

CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id);

-- identities: api_key, jwt, oauth, service_account, mcp_token, ...
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

-- clients: track API consumer origin (cursor, claude-code, script, ...)
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

-- memory_relations: knowledge graph foundation
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

-- memory_embeddings: Phase 5 vector storage (MVP — vectors as JSON text)
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

-- audit_logs: append-only activity trail
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

-- settings: key-value store (bootstrap lock, feature flags, ...)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- auth_accounts: native email/password — one owner_id per registrant (tenant isolation)
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

-- auth_login_attempts: per-email login lockout (credential stuffing guard)
CREATE TABLE IF NOT EXISTS auth_login_attempts (
  email TEXT PRIMARY KEY,
  failed_count INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_attempt_at TEXT NOT NULL,
  last_ip TEXT
);

-- Extension tracks 5.5 / 8.5 (ADR-023, ADR-026)
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
