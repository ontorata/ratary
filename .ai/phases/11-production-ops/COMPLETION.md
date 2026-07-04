# Phase 11 — Production Operations — COMPLETION

**Document:** COMPLETION
**Phase status:** ✅ Complete — Design Approved; SC-11-01 + SC-11-05 pending owner action
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)
**Design:** [DESIGN.md](DESIGN.md) · **ADR-018:** [Production Postgres cutover](../../../docs/adr/018-production-postgres-cutover.md)
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) → Approved ADRs → this document.

---

## Success Criteria Evidence

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| SC-11-01 | Full test suite passes on Postgres staging harness | 🔲 Pending | CI harness ready; live Postgres required |
| SC-11-02 | Cutover + rollback documented with data boundaries | ✅ | [MIGRATION.md](MIGRATION.md) — S0–S4 states, FK-safe order, rollback limits |
| SC-11-03 | Default D1 deploy unchanged; 420 tests at default env | ✅ | `npm run typecheck && npm test` → 420 pass, 0 errors |
| SC-11-04 | No `MemoryService` / `Retriever` rewrite | ✅ | Zero `pg` imports outside `src/infrastructure/` |
| SC-11-05 | Owner sign-off on cutover strategy | 🔲 Pending | Owner sign-off required in [REVIEW.md](REVIEW.md) |
| SC-11-06 | ADR-018 **Approved** before merge | ✅ | ADR-018 Approved 2026-07-03 |

**Result: 4/6 PASS. 2 pending owner action.**

---

## Deliverables Delivered

### 11B — Staging harness

| File | Description |
|------|-------------|
| `src/db/postgres-migrations.ts` | `runPostgresMigrations(ISqlDatabase)` — calls `runSchemaMigrations` with `'postgres'` dialect |
| `scripts/lib/postgres-schema.ts` | `applyPostgresSchema(connectionString)` — pool management + idempotent schema apply |
| `scripts/apply-postgres-schema.ts` | CLI entrypoint; `--database-url` flag |
| `scripts/lib/d1-to-postgres-connection.ts` | D1 source + Postgres target factory; `resolvePostgresTargetUrl` |
| `.github/workflows/postgres-staging.yml` | GitHub Actions job: `postgres:16` service, schema apply, `npm run test:postgres-staging` |
| `tests/db/postgres-staging.integration.test.ts` | 3 live-Postgres integration tests (skipped unless `POSTGRES_STAGING=1`) |

### 11A — Backfill + parity + runbook

| File | Description |
|------|-------------|
| `scripts/lib/d1-to-postgres-backfill.ts` | `METADATA_BACKFILL_TABLES` (FK-safe order); `backfillD1ToPostgres()`; batch upsert |
| `scripts/backfill-d1-to-postgres.ts` | CLI entrypoint; `--dry-run`, `--execute`, `--owner`, `--batch-size`, `--target-url` |
| `scripts/lib/postgres-parity.ts` | `verifyPostgresParity()` — count-based D1 ↔ Postgres parity |
| `scripts/verify-postgres-parity.ts` | CLI entrypoint; exit 0/1 |

### Docs

| File | Description |
|------|-------------|
| `MIGRATION.md` | Cutover runbook: S0→S4 states, prerequisites, step-by-step, rollback, FK order, troubleshooting |
| `TESTING.md` | Gate evidence, per-commit gates, suite inventory |
| `REVIEW.md` | Gate verdict, scope review, architecture review, owner sign-off |
| `RETROSPECTIVE.md` | Lessons learned, risks, recommendations for Phases 12–14 |
| `docs/PANDUAN.md` §8 | Postgres ops: env matrix, commands, backfill, parity, provider backfill commands |

---

## Test Results

### Default env (D1)

```
$ npm run typecheck && npm test

> typecheck
> tsc --noEmit -p tsconfig.build.json
  ✅ 0 errors

> test
  ✅ 420 passed | 3 skipped (423 total)
  Duration: 4.32s
```

### Postgres unit tests (mock-based)

```
tests/db/postgres-migrations.test.ts         ✅ 5 passed
tests/scripts/d1-to-postgres-backfill.test.ts ✅ 6 passed
```

### Postgres staging integration

```
tests/db/postgres-staging.integration.test.ts
  ⏭  3 skipped — POSTGRES_STAGING != '1' or DATABASE_URL not set
  Status: pending — requires live Postgres
```

---

## Scope Verification

### No pg imports outside infrastructure

```
$ grep -rn "from 'pg'" src/ --include="*.ts"
src/infrastructure/sql/postgres-sql-database.adapter.ts: import pg from 'pg'
✅ Only allowed location
```

### No service rewrites

```
$ grep -rn "pg" src/services/ src/domain/ --include="*.ts"
(no output)
✅
```

### Composition root unchanged

All new scripts (`apply-postgres-schema.ts`, `backfill-d1-to-postgres.ts`, `verify-postgres-parity.ts`) use adapter factories directly — no repository edits.

---

## Architecture Verification

| Rule | Evidence |
|------|----------|
| Canonical DDL: `src/db/migrations.ts` | `runPostgresMigrations` calls `runSchemaMigrations(client, 'postgres')` |
| Idempotent schema apply | `CREATE TABLE IF NOT EXISTS`; `information_schema` column check |
| FK-safe backfill order | `METADATA_BACKFILL_TABLES` ordered: org → ws → client → identity → agent → memory → embeddings → relations |
| Dry-run default | `--dry-run` implicit; `--execute` flag required for writes |
| Rollback documented | `SQL_PROVIDER=d1` env flip; write-loss warning; re-backfill procedure |
| Default unchanged | `SQL_PROVIDER=d1`; 420 tests green at default |

---

## Backward Compatibility

- ✅ `SQL_PROVIDER=d1` is the default — all existing deployments unaffected.
- ✅ Repository contracts (`IMemoryRepository`, `ISqlDatabase`) unchanged.
- ✅ REST and MCP response shapes unchanged.
- ✅ No breaking changes to existing API contracts.

---

## ADR Compliance

| ADR | Requirement | Status |
|-----|-------------|--------|
| ADR-009 | `PostgresSqlDatabaseAdapter` implemented | ✅ |
| ADR-018 | Cutover Option A (quiesce + backfill + env flip) | ✅ |
| ADR-018 | No dual-write | ✅ Verified |
| ADR-018 | D1 retained ≥ 30 days | ✅ Documented in MIGRATION.md |
| ADR-018 | `--dry-run` default in backfill CLI | ✅ |
| ADR-018 | Parity script blocks flip on failure | ✅ `exit(1)` on mismatch |

---

## Constitutional Compliance

| Rule | Status |
|------|--------|
| No TODO / FIXME / stub | ✅ Zero in Phase 11 deliverables |
| Evidence-based completion | ✅ 420 tests + typecheck + architecture grep |
| Backward compatible | ✅ Default env unchanged |
| Zero breaking changes | ✅ No public contract changes |
| No dead code | ✅ All scripts wired to `package.json` |
| Scope enforced | ✅ 52 E2E cross-scope tests exist and pass |
| Minimal blast radius | ✅ Scripts additive; no domain rewrites |
| AI-first | ✅ Operational scripts designed for programmatic use |

---

## Outstanding Owner Actions

| # | Action | Blocking | Where |
|---|--------|----------|-------|
| 1 | Provide staging Postgres target (`DATABASE_URL`) | SC-11-01 | CI `postgres-staging` job |
| 2 | Run `postgres-staging` CI job | SC-11-01 | GitHub Actions |
| 3 | Record cutover sign-off in [REVIEW.md](REVIEW.md) | SC-11-05 | Owner sign-off section |
| 4 | Provision production Postgres + run cutover (S2→S3) | Production | [MIGRATION.md](MIGRATION.md) |
| 5 | Retain D1 read-only ≥ 30 days post-cutover | Production | [MIGRATION.md](MIGRATION.md) |

---

## Phase Status

**Design Approved. Implementation complete. Gate pending owner action.**

Phase 11 deliverables are complete and conformant. The operational proof is ready to execute once the owner provisions the staging Postgres target and runs the CI harness.

Production cutover is owner-authorized per ADR-018.

---

*Completion evidence recorded 2026-07-03. Subordinate to [DESIGN.md](DESIGN.md) and [ADR-018](../../../docs/adr/018-production-postgres-cutover.md).*
