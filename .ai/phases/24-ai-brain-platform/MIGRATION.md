# Phase 24 — AI-Brain Platform — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateAiBrainPlatformPhase1()` in `src/db/migrations.ts` (ADR-044).

### Objects

- `platform_webhook_subscriptions` — HMAC webhook CRUD store

---

## Verification

[`tests/db/ai-brain-platform-migration.test.ts`](../../../tests/db/ai-brain-platform-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `AI_BRAIN_PLATFORM_ENABLED=false` — subscriptions persist; delivery consumer off when flag OFF |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
| Delivery dependency | `EVENT_CONSUMERS_ENABLED=true` + Redis event bus for live delivery |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
