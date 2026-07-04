# Phase 8.5 — Quality Signals — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateExtensionTracksPhase1() (signals portion)` in `src/db/migrations.ts` (ADR-026).

### Objects

- `memory_signals` — quality signal ingest store
- Index: idx_memory_signals_owner
- Note: same migration step also adds compression columns (Phase 5.5 scope)

---

## Verification

[`tests/db/extension-tracks-migration.test.ts`](../../../tests/db/extension-tracks-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `SIGNAL_INGEST_ENABLED=false` — table remains; no hot-path writes when OFF |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
