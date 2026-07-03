# ADR-018: Production Postgres Cutover

**Status:** Approved  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  
**Phase:** 11 — Production Operations

---

## Context

Phase 10 shipped `PostgresSqlDatabaseAdapter` ([ADR-009](009-postgresql-metadata-adapter.md)) behind `SQL_PROVIDER=postgres`. Repositories depend on `ISqlDatabase`; default production remains D1 with **405+ tests** at default env.

ADR-009 covers **adapter mechanics** (placeholder translation, factory wiring). It defers steps 2–5 of metadata migration (schema apply on Postgres, backfill, production flip, operational rollback) to a separate ADR.

Phase 11 requires a **documented, reversible, owner-runnable** cutover path without rewriting `MemoryService`, `Retriever`, or MCP/REST contracts.

Design reference: [.ai/phases/11-production-ops/DESIGN.md](../../.ai/phases/11-production-ops/DESIGN.md)

---

## Problem

| Gap | Risk |
|-----|------|
| No full test-suite proof on live Postgres | Dialect or DDL issues discovered only in production |
| `runMigrations()` accepts `D1Client` only | Postgres environments lack idempotent schema bootstrap |
| No backfill / parity procedure | Cutover with row loss or silent drift |
| No rollback boundary documented | Writes on Postgres lost on env flip to D1 |
| Unclear cutover strategy | Accidental dual-write complexity or big-bang deploy |

`MemoryRepository` size (T-01, ~622 lines) is a maintainability concern but **not a gate** for cutover — optional internal split is track 11C ([ADR-004](004-repository-port-types.md) Option B), gated by ADR-019 if structural.

---

## Constraints

- Default `SQL_PROVIDER=d1` unchanged for all existing deployments.
- No `pg` imports in `services/`, controllers, or domain ([ADR-009](009-postgresql-metadata-adapter.md)).
- Repository SQL remains SQLite/D1-authored with `?` placeholders — adapter translates only.
- Canonical DDL stays in `schema.sql` / `src/db/migrations.ts` — no Postgres-native fork in repositories.
- No application-level dual-write unless a future ADR explicitly expands scope.
- No `MemoryServiceV2`, `RetrieverV2`, or breaking REST/MCP shapes.
- `DATABASE_URL` via env only — never committed ([SECURITY.md](../../.ai/core/supplementary/SECURITY.md)).
- Vector (`VECTOR_PROVIDER`), object storage, search, and graph providers **unchanged** during metadata cutover (Phases 12–14).

---

## Alternatives

### Option A — Quiesce window + backfill + env flip (recommended)

1. Brief write quiesce (or maintenance mode).
2. Final incremental backfill D1 → Postgres.
3. Parity verification (row counts + spot checks).
4. Flip `SQL_PROVIDER=postgres`.
5. Rollback: flip to `d1` (with documented data boundary).

- Pros: Simple; no dual-write consistency logic; matches ADR-009 adapter-only swap; low code risk.
- Cons: Requires planned downtime or write freeze; Postgres-only writes after flip not auto-synced to D1 on rollback.

### Option B — Application dual-write (D1 + Postgres)

- Pros: Near-zero downtime during transition.
- Cons: Consistency conflicts, idempotency, and rollback complexity; violates Phase 11 minimal scope; requires new ADR amendment.

### Option C — Big-bang deploy without staging harness

- Pros: Fastest calendar time.
- Cons: Unacceptable risk — rejected.

## Decision

**Adopt Option A — quiesce + backfill + env flip.**

Phase 11 delivers **operational artifacts**, not a new SQL engine:

| Track | Deliverable |
|-------|-------------|
| **11A** | Cutover runbook (`MIGRATION.md`) + owner sign-off |
| **11B** | Staging harness: full `npm test` on `SQL_PROVIDER=postgres` |
| **11C** | Optional `MemoryRepository` reader/writer split — **deferred** until 11B PASS; ADR-019 if structural |
| **11D** | Ops docs (PANDUAN §8, README env matrix) |

### Cutover states

| State | `SQL_PROVIDER` | Writes | Rollback |
|-------|----------------|--------|----------|
| **S0 — Baseline** | `d1` | D1 | — |
| **S1 — Staging proof** | `postgres` (isolated DB) | Staging only | Drop staging DB |
| **S2 — Backfill complete** | `d1` (prod live) | D1 primary; Postgres copy | Discard Postgres copy |
| **S3 — Cutover** | `postgres` | Postgres primary | Flip to `d1` (see rollback) |
| **S4 — Rollback** | `d1` | D1 primary | Postgres retained for re-attempt |

### Production cutover procedure (owner-run)

1. **Prerequisites:** 11B staging harness PASS; secrets in vault; maintenance window scheduled.
2. **Quiesce:** Stop writes or enable read-only mode (REST + MCP) for cutover window.
3. **Schema:** Run `scripts/apply-postgres-schema.ts` on target Postgres (idempotent).
4. **Backfill:** Run `scripts/backfill-d1-to-postgres.ts` (default `--dry-run` off only after dry-run validated).
5. **Parity:** Run `scripts/verify-postgres-parity.ts` — block flip on failure.
6. **Flip:** Set `SQL_PROVIDER=postgres` + `DATABASE_URL`; redeploy.
7. **Smoke:** Health check, sample CRUD, context build, cross-scope E2E subset.
8. **Retain D1:** Keep D1 snapshot read-only **≥ 30 days** — no destructive D1 purge in Phase 11.

### Staging harness (11B)

Minimum gate evidence:

- Ephemeral Postgres (GitHub Actions `postgres` service container **or** documented Docker Compose).
- Apply schema bootstrap before tests.
- `SQL_PROVIDER=postgres DATABASE_URL=... npm test` — full suite green.
- Default CI job continues at `SQL_PROVIDER=d1` (or test mocks) — **405+ tests unchanged**.

Postgres harness runs in a **separate CI job** — must not block the default job.

### Schema parity

- Bootstrap applies same DDL strings as D1 (`MIGRATION_SQL` + enterprise phase SQL) via `ISqlDatabase`.
- Preserve `TEXT` / `INTEGER` boolean columns for repository SQL reuse.
- Bootstrap script uses Postgres-compatible transactions (`BEGIN` / `COMMIT`), not `BEGIN IMMEDIATE`.

### Backfill ordering (FK-safe)

```
organizations → workspaces → clients → identities
→ memories → memory_embeddings → memory_relations
→ audit_logs → (remaining auth/enterprise tables)
```

Backfill uses **upsert by primary key**; idempotent; `--dry-run` default in CLI.

### Environment contract (metadata cutover)

| Variable | Default | Cutover |
|----------|---------|---------|
| `SQL_PROVIDER` | `d1` | `postgres` in staging / after owner flip |
| `DATABASE_URL` | — | Required when `postgres` |
| `D1_*` / `CLOUDFLARE_*` | required for D1 | Required as backfill **source** until D1 retired |
| `VECTOR_PROVIDER` | `d1` | Unchanged — embeddings on same `ISqlDatabase` |
| Other platform flags | defaults | Unchanged |

### Owner decisions (ratified)

| Question | Decision |
|----------|----------|
| Managed Postgres vendor | **Owner choice** — any managed Postgres with standard `DATABASE_URL`; document pool limits in ops runbook |
| Cutover window | **Quiesce / write freeze** (Option A) — not dual-write |
| CI Postgres | **Service container + documented Compose** for local reproduction |
| 11C repository split | **Defer** until 11B PASS; ADR-019 if file boundaries change |
| D1 retention post-cutover | **≥ 30 days** read-only snapshot before archival decision |

---

## Tradeoffs

- **Gain:** Reversible, low-code cutover on existing adapter; staging proof before production flip.
- **Gain:** Default D1 deploys unaffected; Postgres remains opt-in per environment.
- **Accept:** Brief write quiesce during production cutover.
- **Accept:** Postgres-only writes during S3 are **not** automatically synced back to D1 on rollback — runbook must warn operators.
- **Accept:** Schema bootstrap is a separate script path from `runMigrations(D1Client)` — parity maintained via shared DDL source.

---

## Migration

| Step | Action | Owner | Production impact |
|------|--------|-------|-------------------|
| 1 | ADR-018 **Approved** | Owner | None |
| 2 | Readiness Review PASS | Maintainer | None |
| 3 | Implement `apply-postgres-schema.ts` | Dev | None — isolated |
| 4 | Staging harness PASS (11B) | CI / maintainer | None |
| 5 | Implement backfill + verify scripts | Dev | None until owner runs |
| 6 | Dry-run backfill on staging copy | Owner | None |
| 7 | Production cutover (S2 → S3) | Owner | Write path → Postgres |
| 8 | Optional 11C split | Dev | None if refactor-only |

Detailed runbook: `.ai/phases/11-production-ops/MIGRATION.md` (authored during implementation).

---

## Rollback

| Action | Effect |
|--------|--------|
| Set `SQL_PROVIDER=d1` | Immediate return to `D1SqlDatabaseAdapter` |
| Redeploy with D1 credentials | No Postgres connection required |
| Postgres database | Retained for forward-fix / re-cutover |
| Rows written only on Postgres during S3 | **Not on D1** — manual backfill required if rollback after writes |

**Rollback trigger:** Sustained error rate, parity failure post-flip, or owner decision within retention window.

---

## Impact on future phases

| Phase | Impact |
|-------|--------|
| **11 Production Ops** | **Primary ADR** — unblocks staging scripts and runbook |
| **12 Event Pipeline** | May publish to Redis after metadata stable; orthogonal |
| **13 Content & Vector** | pgvector / R2 cutover assumes metadata Postgres path proven here |
| **14 Search & Graph** | Meilisearch / Neo4j production backfill assumes 11B evidence pattern |

---

## Success criteria (Phase 11 gate)

| ID | Criterion |
|----|-----------|
| SC-11-01 | Full test suite passes on Postgres staging harness |
| SC-11-02 | Cutover + rollback documented in `MIGRATION.md` |
| SC-11-03 | Default env 405+ tests green (`SQL_PROVIDER=d1`) |
| SC-11-04 | No `MemoryService` / `Retriever` rewrite |
| SC-11-05 | Owner sign-off in `REVIEW.md` |

---

## Planned implementation artifacts

```
scripts/apply-postgres-schema.ts
scripts/backfill-d1-to-postgres.ts
scripts/verify-postgres-parity.ts
.github/workflows/postgres-staging.yml   # or equivalent documented harness
```

Reuse patterns: `scripts/lib/backfill-sql.ts`, `scripts/lib/backfill-cli.ts`.

---

## References

- [ADR-009 PostgreSQL metadata adapter](009-postgresql-metadata-adapter.md)
- [ADR-004 Repository port types](004-repository-port-types.md)
- [10-POST-ROADMAP.md](../../.ai/phases/roadmap/10-POST-ROADMAP.md)
- [Phase 11 DESIGN](../../.ai/phases/11-production-ops/DESIGN.md)
- [POLICY.md](POLICY.md)

---

*Approved 2026-07-03. Implementation of cutover scripts authorized after Phase 11 Readiness PASS.*
