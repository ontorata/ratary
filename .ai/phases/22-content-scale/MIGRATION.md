# Phase 22 — Content Scale — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateContentScalePlatformPhase1()` in `src/db/migrations.ts` (ADR-021).

### Objects

- `content_scale_sync_runs` — offload/sync job history
- `content_scale_sync_state` — watermark per target (content, pgvector, embedding)

---

## Verification

[`tests/db/content-scale-platform-migration.test.ts`](../../../tests/db/content-scale-platform-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `CONTENT_SCALE_PLATFORM_ENABLED=false` — inline content + D1 vector remain defaults |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
