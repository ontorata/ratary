# Phase 09.8 — Multi-Client Sync — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateExtensionTracksPhase5()` in `src/db/migrations.ts` (ADR-042).

### Objects

- `sync_cursors` — per-client pull cursor
- `sync_conflicts` — manual resolution queue

---

## Verification

[`tests/db/extension-tracks-migration.test.ts`](../../../tests/db/extension-tracks-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `MULTI_CLIENT_SYNC_ENABLED=false` — cursors remain; sync REST disabled when OFF |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
