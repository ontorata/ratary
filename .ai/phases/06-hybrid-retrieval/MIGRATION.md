# Phase 6 — Hybrid Retrieval — MIGRATION

**Document:** MIGRATION  
**Phase status:** Closed (N/A — no migrations)  
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

## Migrations

**N/A — no schema or data migration required for Phase 6.**

Hybrid retrieval composes existing Phase 4 (`SqlRetrievalCandidateSource`) and Phase 5 (`IEmbeddingStore`, `IEmbeddingProvider`) infrastructure. No DDL, backfill, or rollback steps apply to this phase.

Gate evidence: REVIEW.md — Migration **PASS** (N/A, no DDL).

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
