# Phase 11 — Production Operations — IMPLEMENTATION

**Document:** IMPLEMENTATION  
**Phase status:** ✅ Ready — Owner Approved (2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR-018:** [Production Postgres cutover](../../../docs/adr/018-production-postgres-cutover.md)

---

## Purpose

Incremental plan for **operational proof** of Postgres metadata path: schema bootstrap, staging harness, backfill/parity scripts, and ops docs — **without changing** application or domain layers.

Phase 10 landed the adapter; Phase 11 lands the **runbook automation** and **gate evidence**.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Readiness PASS (2026-07-03) |
| **Updated by** | Implementing AI assistant; maintainer on handoff |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | [10-POST-ROADMAP.md — Phase 11](../roadmap/10-POST-ROADMAP.md) |

---

## Constraints (immutable)

| Rule | Enforcement |
|------|-------------|
| No `MemoryService` / `Retriever` / domain edits | Grep + architecture review |
| No `pg` imports outside `src/infrastructure/` | Lint / grep gate |
| SQL provider selection only in `createSqlDatabase()` + scripts | Code review |
| Canonical DDL in `migrations.ts` / `schema.sql` only | No duplicate DDL in scripts |
| Default env unchanged | CI `quality` job: `SQL_PROVIDER` unset → D1 mocks |
| Production flip owner-run only | Documented in [MIGRATION.md](MIGRATION.md); no auto-cutover in deploy |
| One concern per commit | See [commit plan](#commit-plan) |

---

## Current baseline (Phase 10 ✅)

| Artifact | Status |
|----------|--------|
| `PostgresSqlDatabaseAdapter` | ✅ ADR-009 Implemented |
| `createSqlDatabase()` | ✅ `SQL_PROVIDER=postgres` + `DATABASE_URL` |
| `runMigrations(D1Client)` | ✅ D1 only |
| Postgres full-suite CI job | ❌ Not yet |
| Schema bootstrap for Postgres | ❌ Not yet |
| D1 → Postgres backfill script | ❌ Not yet |
| Parity verification script | ❌ Not yet |
| Cutover runbook | ❌ `MIGRATION.md` reserved |

---

## Track overview

| Track | Deliverable | Priority |
|-------|-------------|----------|
| **11B** | Staging harness + schema bootstrap | **P0 — gate blocker** |
| **11A** | Backfill + parity scripts + `MIGRATION.md` | **P0** |
| **11D** | PANDUAN §8 + README ops matrix | P1 |
| **11C** | `MemoryRepository` reader/writer split | **P2 — deferred** until 11B PASS; ADR-019 if structural |

**Recommended sequence:** 11B schema → 11B harness green → 11A scripts → 11A runbook → 11D docs → (optional) 11C.

---

## Architecture (unchanged layers)

```
Transport (REST / MCP)              ← UNCHANGED
Application (services, controllers) ← UNCHANGED
Domain (memory, retriever, search)  ← UNCHANGED
Ports (ISqlDatabase, IMemoryRepository) ← UNCHANGED
Infrastructure (PostgresSqlDatabaseAdapter) ← bugfixes only
Scripts (NEW — Phase 11)            ← schema, backfill, parity
```

Composition roots (`server.ts`, `mcp/server.ts`) **unchanged** unless harness documents test env vars.

---

## Module plan

### 1 — Postgres schema bootstrap (`src/db/`)

Extract D1-agnostic migration runner that accepts `ISqlDatabase`.

| File | Responsibility |
|------|----------------|
| `src/db/postgres-migrations.ts` | `runPostgresMigrations(sql: ISqlDatabase)` — idempotent apply |
| `src/db/migrations.ts` | Refactor: export shared phase functions accepting `ISqlDatabase` where safe, or delegate from postgres-migrations |

**Behavior:**

1. Split `MIGRATION_SQL` statements (reuse existing `splitStatements` helper or export it).
2. Apply `CREATE TABLE` / indexes from canonical strings.
3. Run phase migrations in order: knowledge → memory intelligence → embedding → multi-AI → enterprise (mirror `runMigrations` order).
4. Use `BEGIN` / `COMMIT` (not `BEGIN IMMEDIATE`) for Postgres bootstrap batches.
5. Skip D1-only helpers that introspect via D1 APIs — use `ISqlDatabase.query` for `tableHasColumn` equivalent on Postgres.

**Tests:** `tests/db/postgres-migrations.test.ts` — idempotency (apply twice), table existence smoke with mock `ISqlDatabase` or Testcontainers (optional).

### 2 — CLI scripts (`scripts/`)

| Script | npm script (proposed) | Responsibility |
|--------|---------------------|----------------|
| `scripts/apply-postgres-schema.ts` | `db:apply-postgres-schema` | Connect via `DATABASE_URL`; run `runPostgresMigrations` |
| `scripts/backfill-d1-to-postgres.ts` | `db:backfill-d1-to-postgres` | D1 read → Postgres upsert; `--execute` flag (dry-run default) |
| `scripts/verify-postgres-parity.ts` | `db:verify-postgres-parity` | Row-count parity; exit non-zero on mismatch |

**Shared libraries:**

```
scripts/lib/
├── backfill-cli.ts              # ✅ exists — reuse parseBackfillArgs
├── backfill-sql.ts              # ✅ exists — extend for dual-source
├── postgres-schema.ts           # NEW — CLI wrapper around runPostgresMigrations
├── d1-to-postgres-backfill.ts   # NEW — table-ordered copy logic
└── postgres-parity.ts           # NEW — count queries per table
```

**Backfill table order** (FK-safe, per ADR-018):

```
organizations → workspaces → clients → identities
→ memories → memory_embeddings → memory_relations
→ memory_vectors (if rows exist) → audit_logs → api_keys / oauth / …
```

**Upsert strategy:** `INSERT … ON CONFLICT (id) DO UPDATE` for Postgres target; batch size from `--batch-size=` (default 100).

**Env:**

| Script | Source | Target |
|--------|--------|--------|
| `apply-postgres-schema` | — | `DATABASE_URL` |
| `backfill-d1-to-postgres` | D1 (`SQL_PROVIDER=d1` creds) | `DATABASE_URL` or `--target-url=` |
| `verify-postgres-parity` | D1 | Postgres |

### 3 — Staging harness (11B)

**Option A — GitHub Actions (recommended):**

New workflow `.github/workflows/postgres-staging.yml` (or job in `ci.yml`):

```yaml
# Sketch — implement in C11-4
jobs:
  postgres-staging:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ai_brain_test
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - checkout + npm ci
      - run: npm run db:apply-postgres-schema
        env:
          SQL_PROVIDER: postgres
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ai_brain_test
      - run: npm test
        env:
          SQL_PROVIDER: postgres
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ai_brain_test
          AUTH_SECRET: test-auth-secret-minimum-32-characters!!
          NODE_ENV: test
```

**Rules:**

- Separate job from default `quality` — Postgres failure must not block D1 baseline merges if harness is flaky (document retry policy).
- `continue-on-error: false` once harness stable — gate evidence for Phase 11 close.

**Option B — Local Compose (manual):**

```bash
docker run --rm -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_brain_dev postgres:16
export SQL_PROVIDER=postgres DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_brain_dev POSTGRES_STAGING=1
npm run db:apply-postgres-schema
npm run test:postgres-staging
```

**Note:** Full `npm test` on a shared Postgres instance is not run in CI yet — E2E tests assume isolated bootstrap state. The staging job runs `test:postgres-staging` (schema apply + repository integration).

### 4 — Ops docs (11D)

| Doc | Updates |
|-----|---------|
| `docs/PANDUAN.md` §8 | Postgres staging + cutover checklist |
| `README.md` | Env matrix for metadata cutover; link to MIGRATION.md |
| `.ai/phases/11-production-ops/MIGRATION.md` | Owner runbook (author after scripts land) |

---

## Optional track 11C (deferred)

Split `MemoryRepository` into internal reader/writer modules — **not in initial commit plan**.

| Gate | Requirement |
|------|-------------|
| Prerequisite | 11B staging harness PASS |
| ADR | ADR-019 Approved if new public types or port moves |
| Scope | Refactor-only; zero behavior change; full suite green |

---

## Commit plan

| # | Theme | Scope | Track |
|---|-------|-------|-------|
| C11-1 | `db: add runPostgresMigrations(ISqlDatabase)` | `src/db/postgres-migrations.ts`, tests | 11B |
| C11-2 | `scripts: apply-postgres-schema CLI` | `scripts/apply-postgres-schema.ts`, `package.json` | 11B |
| C11-3 | `test(db): postgres schema idempotency` | `tests/db/postgres-migrations.test.ts` | 11B |
| C11-4 | `ci: postgres staging harness job` | `.github/workflows/postgres-staging.yml` | 11B |
| C11-5 | `scripts: d1-to-postgres backfill library` | `scripts/lib/d1-to-postgres-backfill.ts` | 11A |
| C11-6 | `scripts: backfill + verify CLIs` | `backfill-d1-to-postgres.ts`, `verify-postgres-parity.ts` | 11A |
| C11-7 | `docs(phase-11): MIGRATION runbook` | `MIGRATION.md`, `TESTING.md` evidence | 11A |
| C11-8 | `docs: PANDUAN + README postgres ops` | PANDUAN §8, README | 11D |
| C11-9 | `refactor(repo): memory reader/writer split` | optional — ADR-019 gate | 11C |

**Rule:** no mixing script + CI + gate docs in one commit.

---

## Testing plan

### Gate evidence (Phase 11 close)

| ID | Test | Command / artifact |
|----|------|-------------------|
| SC-11-01 | Full suite on Postgres | CI `postgres-staging` job green |
| SC-11-02 | Runbook exists | `MIGRATION.md` reviewed |
| SC-11-03 | Default env regression | CI `quality` job ≥405 tests |
| SC-11-04 | No service rewrite | Architecture grep |
| SC-11-05 | Owner sign-off | `REVIEW.md` |

### Per-commit gates

| After commit | Required |
|--------------|----------|
| C11-1–C11-3 | `npm run typecheck && npm test` (default env) |
| C11-4 | Postgres job green on PR |
| C11-5–C11-6 | Unit tests for backfill/parity libs; dry-run manual smoke |
| C11-7–C11-8 | Docs only — no test change |

### Postgres-specific suites

| Suite | Purpose |
|-------|---------|
| Schema idempotency | Apply schema twice — no error |
| Backfill dry-run | Logs counts; zero writes |
| Backfill round-trip | Fixture D1 → Postgres → row count match |
| E2E on Postgres harness | `cross-owner-leak`, `cross-workspace-leak`, `cross-org` (same as D1) |

Detail: [TESTING.md](TESTING.md) (author with C11-7).

---

## Environment reference

| Variable | Default | Phase 11 usage |
|----------|---------|----------------|
| `SQL_PROVIDER` | `d1` | `postgres` in staging job / cutover env |
| `DATABASE_URL` | — | Required when `postgres` |
| `CLOUDFLARE_*`, `D1_*` | required for D1 | Backfill **source** |
| `VECTOR_PROVIDER` | `d1` | Unchanged — embeddings on same metadata DB |
| All other `*_PROVIDER` | defaults | Unchanged |

---

## Rollback (implementation)

No code rollback required for Phase 11 deliverables — scripts are additive. Production rollback remains env flip per ADR-018.

If staging harness blocks CI: disable workflow with owner approval; track in `RISKS.md` until fixed.

---

## Milestone tracker

| Milestone | Status | Evidence |
|-----------|--------|----------|
| Readiness PASS | ✅ | [CHECKLIST.md](CHECKLIST.md) |
| ADR-018 Approved | ✅ | [018-production-postgres-cutover.md](../../../docs/adr/018-production-postgres-cutover.md) |
| `runPostgresMigrations` | ✅ | `src/db/postgres-migrations.ts`, `tests/db/postgres-migrations.test.ts` |
| `db:apply-postgres-schema` | ✅ | `scripts/apply-postgres-schema.ts`, `scripts/lib/postgres-schema.ts` |
| Postgres CI job | ✅ | `.github/workflows/postgres-staging.yml`, `npm run test:postgres-staging` |
| Backfill + parity scripts | ✅ | `scripts/lib/d1-to-postgres-backfill.ts`, `scripts/backfill-d1-to-postgres.ts`, `scripts/verify-postgres-parity.ts`, `tests/scripts/d1-to-postgres-backfill.test.ts` |
| `MIGRATION.md` runbook | ✅ | [MIGRATION.md](MIGRATION.md) — cutover S0→S4, rollback, FK order |
| Ops docs (11D) | ✅ | [PANDUAN.md §8](https://github.com/lutfi04/ai-brain/blob/main/docs/PANDUAN.md#8-infrastruktur-platform-fase-10--11) — Postgres ops matrix |
| TESTING.md | ✅ | [TESTING.md](TESTING.md) — gate evidence |
| REVIEW.md | ✅ | [REVIEW.md](REVIEW.md) — gate verdict; owner sign-off pending |
| COMPLETION.md | ✅ | [COMPLETION.md](COMPLETION.md) — success criteria evidence |
| RETROSPECTIVE.md | ✅ | [RETROSPECTIVE.md](RETROSPECTIVE.md) — lessons learned |
| Staging harness PASS | 🔲 Pending | Requires live Postgres — owner provides `DATABASE_URL` |
| 11C repo split | ⏸️ Deferred | Optional; requires ADR-019 if structural |

---

## Handoff notes

1. All implementation artifacts delivered — C11-1 through C11-8 complete.
2. **Do not production-flip** until staging harness PASS + owner sign-off.
3. Owner must provide staging Postgres target (`DATABASE_URL`) to complete SC-11-01.
4. Owner sign-off required for SC-11-05 — record in [REVIEW.md](REVIEW.md) sign decision record.

---

*Implementation plan 2026-07-03. Updated 2026-07-04 with all artifacts delivered. Subordinate to [DESIGN.md](DESIGN.md) and [ADR-018](../../../docs/adr/018-production-postgres-cutover.md).*
