# Phase 4 — Memory Intelligence — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-01  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | First schema or data migration identified for phase |
| **Updated by** | Implementing assistant; owner for production deploy |
| **Read-only when** | Phase gate PASS; post-close hotfixes append addenda only |
| **Roadmap relation** | Documents persistence changes required by phase dependencies |

---

## Schema changes (additive)

Applied via `migrateMemoryIntelligencePhase1() + migrateMemoryIntelligencePhase3()` in `src/db/migrations.ts`.

### Objects

- `memories` columns: project_id, level, last_accessed, access_count, embedding_id, object_key, semantic_hash
- Retrieval indexes: idx_memories_project_id, idx_memories_level, idx_memories_last_accessed, idx_memories_retrieval

---

## Verification

[`tests/db/postgres-migrations.test.ts`](../../../tests/db/postgres-migrations.test.ts)

| Property | Value |
|----------|-------|
| Rollback | Forward-fix only; importance backfill via CLI dry-run default |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |

## Data backfill

`scripts/backfill-importance.ts` — dry-run default; idempotent importance scoring.

---

Gate evidence: migration test green at gate 2026-07-01.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
