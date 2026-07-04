# Phase 8.8 — Inspection Pattern Ledger — MIGRATION

**Document:** MIGRATION  
**Phase status:** ✅ Complete (2026-07-05)  
**Design:** [DESIGN.md](DESIGN.md)

---

## Schema (SQL)

Applied via `migrateExtensionTracksPhase8` in `src/db/migrations.ts`:

| Table | Purpose |
|-------|---------|
| `inspection_patterns` | Ledger entries with confidence + lifecycle |
| `inspection_pattern_events` | Signal → pattern audit links |
| `inspection_pattern_contradictions` | Detected opposing patterns |

Unique index: `(owner_id, pattern_scope, pattern_key, workspace_id)`.

---

## Rollback

Disable `INSPECTION_LEDGER_ENABLED` — tables dormant; no `memories` schema change.

---

## Idempotency

`CREATE IF NOT EXISTS`; miner upserts by stable `pattern_key` from category + trigger hash.
