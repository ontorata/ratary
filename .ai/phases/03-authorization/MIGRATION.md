# Phase 3 — Authorization — MIGRATION

**Phase status:** Closed (N/A — no migrations)  
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

## Migrations

**N/A — no new DDL — authorization reuses Phase 1 `identities` table (`secret_hash`, `owner_id`, `active`). Fastify auth plugin validates API keys against existing schema**

| Property | Value |
|----------|-------|
| Rollback | Disable auth middleware config; schema unchanged |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |

Gate evidence: [REVIEW.md](REVIEW.md) — Migration **PASS** (N/A, no DDL).


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
