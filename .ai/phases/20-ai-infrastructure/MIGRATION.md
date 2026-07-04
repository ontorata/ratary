# Phase 20 — AI Infrastructure Platform — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
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

Phase introduces additive DDL in `src/db/migrations.ts`. Verification: [`tests/db/infrastructure-platform-migration.test.ts`](../../../tests/db/infrastructure-platform-migration.test.ts).

| Property | Value |
|----------|-------|
| Rollback | Disable master env flag — tables remain; no hot-path dependency when OFF |
| Idempotency | Migration runner applies forward-only steps |
| Production | Opt-in; default deploy unchanged |

Gate evidence: migration test green at gate 2026-07-04.

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
