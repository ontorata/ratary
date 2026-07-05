# Phase 1 — Foundation — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-06-28  
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

Applied via `runMigrations() / MIGRATION_SQL` in `src/db/migrations.ts`.

### Objects

- `memories` — core CRUD table + indexes
- `identities` — API key / identity store (`secret_hash` unique partial index)
- `clients` — registered client metadata
- `audit_logs` — security audit trail
- `settings` — key/value config

---

## Verification

[`tests/db/postgres-migrations.test.ts`](../../../tests/db/postgres-migrations.test.ts)

| Property | Value |
|----------|-------|
| Rollback | Revert release; forward-fix only — no column drops in production |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |

## Rollout steps

| Step | Action | Production impact |
|------|--------|-------------------|
| 1 | Deploy application | Runs `runMigrations()` on startup |
| 2 | Verify schema | Canonical snapshot: `schema.sql` at repo root |

---

Gate evidence: migration test green at gate 2026-06-28.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
