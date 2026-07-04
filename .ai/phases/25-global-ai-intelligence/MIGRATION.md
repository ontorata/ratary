# Phase 25 — Global AI Intelligence — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateGlobalIntelligencePhase1()` in `src/db/migrations.ts` (ADR-036, ADR-037, ADR-038, ADR-043).

### Objects

- `intelligence_telemetry_events` — redacted telemetry envelope store
- `intelligence_sync_state` — 5-tier sync cursor metadata
- `intelligence_offline_journal` — offline replay journal

---

## Verification

[`tests/global-intelligence/migration.test.ts`](../../../tests/global-intelligence/migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false` — analytics read-only; no memory writes |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
