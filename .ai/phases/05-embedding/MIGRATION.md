# Phase 5 — Embedding — MIGRATION

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

Applied via `migrateEmbeddingPhase1()` in `src/db/migrations.ts` (ADR-003).

### Objects

- `memory_embeddings` — vector storage table (dimensions, model, owner_id)
- Indexes on memory_embeddings for owner + memory lookup

---

## Verification

[`tests/db/embedding-migration.test.ts`](../../../tests/db/embedding-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `EMBEDDING_PROVIDER=noop` — tables remain; no hot-path dependency when disabled |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |

## Data backfill

`scripts/backfill-embeddings.ts` — async job; dry-run default.

---

Gate evidence: migration test green at gate 2026-07-01.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
