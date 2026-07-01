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

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_codename
  ON memories(owner_id, codename) WHERE codename IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_slug
  ON memories(owner_id, slug) WHERE slug IS NOT NULL;

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
