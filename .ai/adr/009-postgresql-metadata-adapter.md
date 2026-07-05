# ADR-009: PostgreSQL Metadata Adapter

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T1)  
**Deciders:** Project owner  

---

## Context

Phase 10 introduced `ISqlDatabase` and `D1SqlDatabaseAdapter` so repositories depend on a vendor-neutral SQL port ([ADR-008](008-platform-architecture.md)). Enterprise scale may require PostgreSQL for metadata workloads beyond Cloudflare D1 limits.

Repositories author SQL with SQLite/D1 `?` placeholders. A Postgres adapter must translate placeholders without changing application or domain code.

## Problem

Production defaults to D1. Swapping to PostgreSQL without an ADR risks dialect drift, untested migration paths, and vendor imports leaking into services.

## Constraints

- `ISqlDatabase` contract unchanged.
- Default `SQL_PROVIDER=d1` preserves current behavior and full test baseline.
- No `pg` imports in `services/`, controllers, or domain.
- Schema migrations remain SQLite-oriented for D1; Postgres rollout uses separate runbook (dual-write / backfill).

## Decision

**Adopt PostgreSQL as an opt-in SQL provider:**

1. `PostgresSqlDatabaseAdapter` in `src/infrastructure/sql/postgres-sql-database.adapter.ts`
2. `translateQuestionMarkPlaceholders()` maps `?` → `$1`, `$2`, …
3. `SQL_PROVIDER=postgres` + `DATABASE_URL` at composition root via `createSqlDatabase()`
4. D1 credentials optional when `SQL_PROVIDER=postgres`

MariaDB, MySQL, SQLite adapters deferred — may reuse mysql2/sqlite drivers in future ADRs.

## Migration

| Step | Action |
|------|--------|
| 1 | Deploy adapter; keep `SQL_PROVIDER=d1` |
| 2 | Apply Postgres schema (parity with D1 migrations — separate script) |
| 3 | Backfill D1 → Postgres |
| 4 | Flip `SQL_PROVIDER=postgres` per environment |
| 5 | Rollback: revert flag to `d1` |

## Rollback

Set `SQL_PROVIDER=d1`. Postgres data retained for forward-fix; no automatic column drops.

## References

- [ADR-004 Repository port types](004-repository-port-types.md)
- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `PostgresSqlDatabaseAdapter` | `src/infrastructure/sql/postgres-sql-database.adapter.ts` |
| Placeholder translation | `src/infrastructure/_shared/sql-placeholders.ts` |
| Factory | `src/infrastructure/composition/create-sql-database.ts` |
| Env validation | `src/config/env.ts` (`SQL_PROVIDER`, `DATABASE_URL`) |
| Unit + contract tests | `tests/infrastructure/postgres-sql-database.adapter.test.ts` |

**Default:** `SQL_PROVIDER=d1`. Production cutover: [ADR-018](018-production-postgres-cutover.md) **Approved** — scripts after Readiness PASS.
