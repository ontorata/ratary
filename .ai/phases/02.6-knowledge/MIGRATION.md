# Phase 2.6 — Knowledge Foundation — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-06-30  
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

Applied via `migrateKnowledgeFoundationPhase1() + migrateKnowledgeFoundationPhase3()` in `src/db/migrations.ts` (ADR-002 knowledge columns).

### Objects

- `memories` columns: codename, slug, keywords, category, memory_type, importance, language, notes
- `memory_relations` — graph edge store (used by Phase 8)
- Indexes: idx_memories_owner_category, idx_memories_memory_type, idx_memories_importance
- Unique partial indexes: idx_memories_owner_codename, idx_memories_owner_slug (Phase 3 backfill)

---

## Verification

[`tests/db/postgres-migrations.test.ts`](../../../tests/db/postgres-migrations.test.ts)

| Property | Value |
|----------|-------|
| Rollback | Forward-fix only; nullable/additive columns |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |

## Data backfill

Slug/codename uniqueness requires backfill before unique indexes (M3). Scripts in Phase 2.6 IMPLEMENTATION.

---

Gate evidence: migration test green at gate 2026-06-30.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
