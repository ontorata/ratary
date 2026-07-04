# Phase 23 — Enterprise Knowledge Fabric — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateKnowledgeFabricPlatformPhase1()` in `src/db/migrations.ts` (ADR-047).

### Objects

- `knowledge_fabric_ingest_runs` — connector ingest job history
- `knowledge_fabric_connector_state` — cursor per connector/owner
- `knowledge_fabric_external_refs` — external ID → memory_id mapping

---

## Verification

[`tests/db/knowledge-fabric-platform-migration.test.ts`](../../../tests/db/knowledge-fabric-platform-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `KNOWLEDGE_FABRIC_ENABLED=false` |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
