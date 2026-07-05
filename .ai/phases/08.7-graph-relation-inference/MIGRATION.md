# Phase 8.7 — Graph Relation Inference — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateExtensionTracksPhase3()` in `src/db/migrations.ts` (ADR-041).

### Objects

- `relation_inference_evidence` — audit trail for inferred edges

---

## Verification

[`tests/db/extension-tracks-migration.test.ts`](../../../tests/db/extension-tracks-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `RELATION_INFERENCE_ENABLED=false` — inferred edges persist; no hot-path inference when OFF |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
