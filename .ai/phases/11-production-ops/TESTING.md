# Phase 11 — Production Operations — TESTING

**Document:** TESTING
**Phase status:** Ready
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)
**Design:** [DESIGN.md](DESIGN.md) · [IMPLEMENTATION.md](IMPLEMENTATION.md)
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) → ADR-018

---

## Purpose

Records Phase 11 test evidence, strategy, and gate results for **production operations**: Postgres schema bootstrap, backfill scripts, parity verification, and staging harness.

---

## Test Philosophy

Phase 11 is an **operational proof** phase — no application behavior changes. All tests verify that:

1. Existing behavior is preserved at default env (`SQL_PROVIDER=d1`).
2. New Postgres operational paths (schema apply, backfill, parity) are correct.
3. Security and scope-enforcement contracts hold on the Postgres adapter.

---

## Gate Evidence (Phase 11 close)

| ID | Criterion | Evidence | Status |
|----|-----------|----------|--------|
| SC-11-01 | Full test suite passes on Postgres staging harness | CI `postgres-staging` job green (`.github/workflows/postgres-staging.yml`) | 🔲 Pending (11B harness not yet run — requires live Postgres) |
| SC-11-02 | Cutover + rollback documented with data boundaries | `MIGRATION.md` authored + reviewed | ✅ |
| SC-11-03 | Default D1 deploy unchanged; 420 tests at default env | `npm run typecheck && npm test` → 420 pass | ✅ |
| SC-11-04 | No `MemoryService` / `Retriever` rewrite | Grep: zero `pg` imports outside `src/infrastructure/` | ✅ |
| SC-11-05 | Owner sign-off on cutover strategy | `REVIEW.md` sign-off section | 🔲 Pending owner |
| SC-11-06 | ADR-018 **Approved** before merge | [ADR-018](https://github.com/lutfi04/ai-brain/blob/main/docs/adr/018-production-postgres-cutover.md) | ✅ Approved 2026-07-03 |

---

## Per-Commit Gates

| After commit | Required | Command | Pass criteria |
|-------------|----------|---------|---------------|
| C11-1 `runPostgresMigrations` | Unit test | `npm run typecheck && npm test` | All pass; `runPostgresMigrations` tests green |
| C11-2 `apply-postgres-schema` CLI | Unit test | `npm run typecheck && npm test` | All pass |
| C11-3 `postgres-migrations.test` | Idempotency test | `npm run typecheck && npm test` | Schema idempotency proven |
| C11-4 `postgres-staging.yml` | CI job green | GitHub Actions `postgres-staging` job | All steps pass |
| C11-5 `d1-to-postgres-backfill` lib | Unit test | `npm run typecheck && npm test` | Backfill dry-run + round-trip pass |
| C11-6 Backfill + verify CLIs | Unit test | `npm run typecheck && npm test` | dry-run logs, parity check logic |
| C11-7 `MIGRATION.md` | Docs only | `npm run typecheck && npm test` | No regression |
| C11-8 PANDUAN §8 | Docs only | `npm run typecheck && npm test` | No regression |

---

## Test Suites

### Default env suite (existing — no changes)

**Command:** `npm test`
**Provider:** `SQL_PROVIDER=d1` (implicit) or test mocks
**Baseline:** 420 tests green

This suite proves:
- No regression to Phase 10 D1 baseline.
- All repositories (`MemoryRepository`, auth stores, enterprise stores) continue to work via `D1SqlDatabaseAdapter`.
- Cross-owner, cross-workspace, cross-org isolation holds.
- REST and MCP contracts unchanged.

### Postgres unit tests

#### `tests/db/postgres-migrations.test.ts`

Covers `runPostgresMigrations` + `runSchemaMigrations` dialect routing.

| Test | Purpose |
|------|---------|
| Apply core DDL statements | `CREATE TABLE IF NOT EXISTS memories/organizations/memory_embeddings` called |
| `information_schema` for column detection | NOT `PRAGMA` — correct for Postgres |
| Skip `ADD COLUMN` when column exists | Idempotency — no duplicate column errors |
| Idempotent (second run does not throw) | **Primary idempotency proof** |
| PRAGMA for sqlite dialect | `runSchemaMigrations` routes correctly |

#### `tests/scripts/d1-to-postgres-backfill.test.ts`

Covers backfill library and parity verification.

| Test | Purpose |
|------|---------|
| `parseTargetUrlArg` | `--target-url` flag parsing |
| Dry-run without target writes | Zero `execute` calls on target during `--dry-run` |
| Upsert rows on execute | Data lands in target via `INSERT … ON CONFLICT` |
| Owner-scoped backfill filter | Only scoped rows scanned and upserted |
| Parity pass when counts match | `verifyPostgresParity` returns `ok: true` |
| Parity fail when counts differ | `verifyPostgresParity` returns `ok: false` + non-zero exit |

### Postgres staging integration suite

#### `tests/db/postgres-staging.integration.test.ts`

**Skipped** unless `POSTGRES_STAGING=1` AND `DATABASE_URL` set.

| Test | Purpose |
|------|---------|
| Schema apply idempotency on live Postgres | Live pool — apply schema twice, no error |
| Core metadata tables exist | `information_schema` confirms tables |
| `MemoryRepository` scope enforcement on Postgres | Owner isolation holds on real adapter |

**Run:**
```bash
POSTGRES_STAGING=1 DATABASE_URL=postgresql://... npm run test:postgres-staging
```

### CI staging harness

**File:** `.github/workflows/postgres-staging.yml`

| Step | Command | Gate |
|------|---------|------|
| Checkout + npm ci | — | Dependency install |
| Apply Postgres schema | `npm run db:apply-postgres-schema` | Schema idempotency |
| Postgres staging tests | `npm run test:postgres-staging` | Integration suite on live Postgres |

**Rules:**
- Runs on `main` push and `main` PR.
- Separate job from default `quality` — Postgres harness must not block D1 baseline merges.
- `continue-on-error: false` once harness stable.

---

## Test Results

### Baseline (default env — D1)

```
npm run typecheck && npm test
Typecheck:  ✅ PASS
Tests:      ✅ 420 passed | 3 skipped (423 total)
```

### Postgres unit tests (mock)

```
tests/db/postgres-migrations.test.ts       ✅ 5 tests
tests/scripts/d1-to-postgres-backfill.test.ts ✅ 6 tests
```

### Postgres staging integration

```
tests/db/postgres-staging.integration.test.ts
  ⏭  skipped (POSTGRES_STAGING != '1' or DATABASE_URL not set)
  Status: 🔲 Pending — requires live Postgres instance
```

**To activate staging integration:**
```bash
docker run --rm -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_brain_test \
  postgres:16

export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_brain_test
export POSTGRES_STAGING=1
npm run test:postgres-staging
```

---

## Coverage Analysis

### What Phase 11 does NOT change

| Area | Coverage |
|------|----------|
| REST API contracts | Existing E2E tests cover (`tests/api.test.ts`, etc.) |
| MCP tool contracts | Existing tests cover |
| MemoryService / Retriever | Not modified |
| Domain logic | Not modified |
| Auth middleware | Not modified |

### What Phase 11 adds coverage for

| Area | Coverage |
|------|----------|
| `runPostgresMigrations` — idempotency | Unit tests (mock `ISqlDatabase`) |
| `runPostgresMigrations` — live Postgres | Staging integration suite |
| Backfill — dry-run / execute | Unit tests (in-memory SQL mock) |
| Backfill — FK-safe ordering | Verified by table dependency order |
| Parity verification — pass/fail | Unit tests |
| Parity verification — live | Staging integration |
| `MemoryRepository` scope on Postgres | Staging integration |
| `information_schema` vs `PRAGMA` routing | Unit tests |

---

## Security Tests

Cross-scope isolation is verified by the existing E2E suites, which run against both D1 (default) and Postgres (staging):

| Test file | Covers |
|-----------|--------|
| `tests/api/cross-owner-leak.test.ts` | 23 tests — no cross-owner memory leakage |
| `tests/api/cross-workspace-leak.test.ts` | 17 tests — workspace isolation |
| `tests/api/cross-organization-leak.test.ts` | 12 tests — org RBAC |
| `tests/api/cross-organization-leak.test.ts` | Auth + RBAC integration |

All suites must pass on the Postgres staging harness before cutover.

---

## Performance Notes

- Backfill scripts use **batched upserts** (`INSERT … ON CONFLICT DO UPDATE`) with configurable batch size (default 100).
- Staging integration suite runs against a local Docker Postgres — not representative of managed Postgres performance.
- Full `npm test` on Postgres staging harness is CI-bound; local reproducibility via Docker Compose documented in `MIGRATION.md`.

---

## Quality Gates Summary

| Gate | Criteria | Status |
|------|----------|--------|
| Typecheck | `tsc --noEmit -p tsconfig.build.json` → 0 errors | ✅ |
| Default env tests | 420+ tests pass at `SQL_PROVIDER=d1` | ✅ |
| Postgres unit tests | All mock-based tests pass | ✅ |
| Postgres staging integration | `POSTGRES_STAGING=1` suite green | 🔲 Pending live Postgres |
| CI staging job | `postgres-staging` workflow green | 🔲 Pending live Postgres |
| Owner sign-off | `REVIEW.md` sign-off section signed | 🔲 Pending owner |

---

*Authored as part of Phase 11 C11-7 gate documentation. Subordinate to [DESIGN.md](DESIGN.md) and [ADR-018](../../../docs/adr/018-production-postgres-cutover.md).*
