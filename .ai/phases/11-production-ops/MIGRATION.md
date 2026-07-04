# Phase 11 — Production Operations — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Scope

Phase 10 introduced Postgres adapter (`PostgresSqlDatabaseAdapter`, ADR-009). Phase 11 adds **data migration tooling** and **cutover runbook** — not new domain DDL.

**No new application DDL in this phase.** Phase 11 delivers **operational proof** of the Postgres metadata path per [ADR-018](../../adr/018-production-postgres-cutover.md): schema bootstrap, staging harness, backfill/parity scripts, and owner-run cutover runbook.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Postgres migration runner | `src/db/postgres-migrations.ts` → `runPostgresMigrations()` |
| Schema bootstrap CLI | `scripts/apply-postgres-schema.ts` — `npm run db:apply-postgres-schema` |
| D1 → Postgres backfill | `scripts/backfill-d1-to-postgres.ts` — dry-run default |
| Parity verification | `scripts/verify-postgres-parity.ts` — exit 0/1 on count mismatch |
| Staging CI | `.github/workflows/postgres-staging.yml` — Postgres 16 service |
| Runbook detail | [IMPLEMENTATION.md](IMPLEMENTATION.md) |

---

## Cutover stages (owner-run)

| Stage | Action | Rollback |
|-------|--------|----------|
| **S0** | Deploy code; `SQL_PROVIDER` unset (D1 default) | N/A |
| **S1** | `npm run db:apply-postgres-schema` on target Postgres | Drop test DB only in staging |
| **S2** | `npm run db:backfill-d1-to-postgres` (dry-run) → review | N/A |
| **S3** | `npm run db:backfill-d1-to-postgres -- --execute` | Re-run from D1 source; idempotent upsert |
| **S4** | `npm run db:verify-postgres-parity` → flip `SQL_PROVIDER=postgres` | Set `SQL_PROVIDER=d1`; Postgres remains warm standby |

**Backfill order (FK-safe):** organizations → workspaces → clients → identities → memories → memory_embeddings → memory_relations → audit_logs → downstream platform tables.

---

## Verification

- [`tests/db/postgres-migrations.test.ts`](../../../tests/db/postgres-migrations.test.ts) — idempotency
- [`tests/scripts/d1-to-postgres-backfill.test.ts`](../../../tests/scripts/d1-to-postgres-backfill.test.ts)
- CI: `postgres-staging.yml` green at gate 2026-07-04

Gate evidence: [REVIEW.md](REVIEW.md) — Migration **PASS** (data/ops runbook).


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
