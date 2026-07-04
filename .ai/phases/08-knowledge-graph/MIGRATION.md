# Phase 8 — Knowledge Graph — MIGRATION

**Phase status:** Closed (N/A — no new DDL)  
**Gate:** PASS 2026-07-03  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Migrations

**N/A — no new DDL for Phase 8.**

Graph retrieval reuses the existing `memory_relations` table and Phase 4 relation CRUD. Phase 8 adds `IGraphProvider` port, in-process BFS adapter, and a third composite retrieval leg — no schema change required for the D1 MVP path.

| Property | Value |
|----------|-------|
| Rollback | `GRAPH_RETRIEVAL=false` — instant; SQL/vector legs unchanged |
| Neo4j scale path | Opt-in `GRAPH_PROVIDER=neo4j` (Phase 10 adapter) — separate backfill via `db:backfill-neo4j` |

Gate evidence: [REVIEW.md](REVIEW.md) — Migration **PASS** (N/A, no DDL).

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
