# Phase 9 — Multi-AI — MIGRATION

**Phase status:** Implemented — `migrateMultiAiPhase1` in `src/db/migrations.ts` + `scripts/backfill-workspaces.ts`

---

## Schema (forward)

### New tables

```sql
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  slug TEXT NOT NULL DEFAULT 'default',
  created_at TEXT NOT NULL,
  UNIQUE (owner_id, slug)
);

CREATE TABLE agents (
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

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_agents_workspace ON agents(workspace_id);
CREATE INDEX idx_agents_owner ON agents(owner_id);
```

### Alter memories

```sql
ALTER TABLE memories ADD COLUMN workspace_id TEXT;
ALTER TABLE memories ADD COLUMN last_modified_by_agent_id TEXT;

CREATE INDEX idx_memories_workspace ON memories(workspace_id);
```

---

## Backfill (idempotent)

1. For each distinct `owner_id` in `memories`:
   - Insert workspace `{ slug: 'default', name: 'Default' }` if not exists.
2. Set `memories.workspace_id` to owner's default workspace id where NULL.
3. Verify: `SELECT owner_id, COUNT(*) FROM memories WHERE workspace_id IS NULL` → 0.

Script: `scripts/backfill-workspaces.ts` — run via `npm run db:backfill-workspaces` (idempotent; exits non-zero if any `workspace_id` remains NULL).

---

## Rollback

1. Stop writing `workspace_id` in application (feature flag or revert).
2. Queries revert to `owner_id` only.
3. Optional DDL rollback migration drops columns/tables (non-destructive to memories if column nullable).

---

*Subordinate to [ADR-007](../../../docs/adr/007-multi-ai-workspace-scope.md).*
