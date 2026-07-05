# Phase 6.6 — Precision Search Platform — MIGRATION

**Status:** ✅ Shipped (2026-07-05) · commit `66d72dc`  
**ADR:** [ADR-060](../../adr/060-precision-search-platform.md)

---

## Schema changes

### `memories` table

```sql
-- 6.6A
ALTER TABLE memories ADD COLUMN aliases TEXT NOT NULL DEFAULT '[]';
ALTER TABLE memories ADD COLUMN source_path TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_source_path
  ON memories(owner_id, source_path) WHERE source_path IS NOT NULL;
```

Postgres parity: same columns applied via `runSchemaMigrations` when `SQL_PROVIDER=postgres`.

### Optional `memory_chunks` (6.6E — defer if gate splits)

```sql
CREATE TABLE IF NOT EXISTS memory_chunks (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding_id TEXT,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (memory_id, chunk_index)
);
```

---

## Backfill scripts

| Script | Purpose |
|--------|---------|
| `db:backfill-precision-search` | Set `aliases=[]` where null; optional promote `keywords` → aliases (dry-run default) |
| `db:backfill-source-path` | Parse import provenance markers in content for `\`path\`` hints (best-effort) |

---

## Rollback

1. Set `PRECISION_SEARCH_ENABLED=false`.
2. Columns remain nullable / defaulted — no drop required for rollback.
3. Drop index `idx_memories_owner_source_path` only if full revert approved (data loss for path uniqueness constraint).

---

## N/A

When gate cancelled: mark MIGRATION **N/A** and archive DDL draft in ADR addendum only.
