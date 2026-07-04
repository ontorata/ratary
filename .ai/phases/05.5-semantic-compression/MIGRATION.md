# Phase 5.5 — Semantic Compression — MIGRATION

**Status:** Implemented (2026-07-04)  
**Schema impact:** Additive columns on `memories` — no new tables

---

## Columns added

| Column | Type | Purpose |
|--------|------|---------|
| `compression_meta` | TEXT NULL (JSON) | `CompressionMetadata` audit trail |
| `compression_version` | INTEGER NULL | Policy version applied |
| `lifecycle_state` | TEXT NULL | Lifecycle tracking (extension track) |

Migration: `src/db/migrations.ts` — idempotent `ALTER TABLE` when column missing.

Canonical schema: `schema.sql` includes all three columns.

---

## Relation type

| Relation | Semantics |
|----------|-----------|
| `consolidates` | Summary memory → source memory (added to `RELATION_TYPES`) |

---

## Forward path

1. `npm run db:migrate` — applies columns on D1/Postgres
2. Existing rows: `compression_meta` null (no backfill required)
3. Optional execute: `npm run compress:memories:execute` per owner scope
4. Re-embed summary rows: `npm run db:backfill-embeddings:execute`

---

## Rollback

1. Set `COMPRESSION_ENABLED=false` — stops new compression
2. Summary memories remain valid — no data loss
3. Column drop deferred (append-only migration policy)

---

## Postgres parity

Phase 11 production ops includes these columns in Postgres schema apply path.
