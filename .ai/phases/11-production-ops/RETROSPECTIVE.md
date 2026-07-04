# Phase 11 — Production Operations — RETROSPECTIVE

**Document:** RETROSPECTIVE
**Phase status:** ✅ Gate PASS (2026-07-04)
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)
**Design:** [DESIGN.md](DESIGN.md) · **ADR-018:** [Production Postgres cutover](../../../docs/adr/018-production-postgres-cutover.md)

---

## Purpose

Records lessons learned from Phase 11 — Production Operations — to inform Phases 12–14 and future infrastructure phases.

---

## What Went Well

### Clear architectural boundary

Phase 10 delivered `PostgresSqlDatabaseAdapter` (ADR-009) and `ISqlDatabase` port. Phase 11 operated **strictly within that boundary**: no new ports, no adapter changes, no domain rewrites. The composition root (`createSqlDatabase`) remained untouched. This made Phase 11 a low-risk operational deliverable rather than a structural one.

### Script-first approach

Delivering backfill, parity, and schema scripts as standalone CLIs (rather than embedded migrations or one-off scripts) meant:
- Each script is independently testable.
- Owner can run them manually without CI.
- Dry-run default prevents accidental data writes.
- Exit codes enable CI gating and runbook automation.

### Idempotent schema bootstrap

Using `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ADD COLUMN IF NOT EXISTS` (via `information_schema` check) means schema apply is safe to re-run. This is critical for rollback and re-cutover scenarios.

### FK-safe backfill ordering

Defining `METADATA_BACKFILL_TABLES` as a canonical ordered array (organizations → workspaces → … → audit_logs) prevents FK constraint violations during incremental or re-attempted backfill.

### PANDUAN §8 integration

Embedding Postgres ops directly in `docs/PANDUAN.md` §8 rather than a separate ops doc means the runbook lives where developers and operators already look for operational guidance.

---

## What Could Be Improved

### Staging Postgres target — resolved (2026-07-04)

Phase 11 shipped the CI harness (`.github/workflows/postgres-staging.yml`). SC-11-01 was completed when the owner provisioned **local PostgreSQL on `localhost:5432`**. Local verification: schema apply idempotent (2 runs), `test:postgres-staging` **3/3 PASS**.

**Lesson (confirmed):** A provisioned staging target unblocks the gate quickly once scripts exist. CI service containers mirror the same harness on `main`.

**Remaining:** Confirm GitHub Actions `postgres-staging` job green; optional but recommended.

### Integration test at CI time — partially resolved

The `postgres-staging.integration.test.ts` suite runs when `POSTGRES_STAGING=1` — now **proven on live Postgres** (2026-07-04). Default `npm test` still skips it; CI workflow runs it via service container.

**Lesson:** Service-container CI jobs are the right pattern — local reproduction path documented in [TESTING.md](TESTING.md).

### MIGRATION.md came late in the sequence

The cutover runbook was drafted after the scripts landed, rather than in parallel with implementation. While the scripts were self-documenting, deriving the runbook from implementation (rather than driving implementation from the runbook) risked minor gaps.

**Lesson:** For operational proof phases, **write the runbook first** (as a specification), then implement scripts to satisfy it.

**Action:** Phase 12 and beyond — author `MIGRATION.md` at the same time as script implementation, not after.

---

## Risks That Did Not Materialize

| Risk | Mitigation | Outcome |
|------|-----------|---------|
| R11-01 Schema drift D1 ↔ Postgres | Shared `MIGRATION_SQL`; `runSchemaMigrations(client, 'postgres')` | ✅ Did not drift — same DDL source |
| R11-03 Staging not representative | `test:postgres-staging` harness | ✅ PASS local 2026-07-04 (3/3) |
| R11-05 Default D1 regression | 457-test baseline unchanged | ✅ No regression (2026-07-04) |
| R11-07 SQL dialect edge cases | `information_schema` for Postgres; `PRAGMA` for D1 | ✅ Correct routing verified |

---

## Risks That Did Materialize

None — Phase 11 implementation completed without triggering any tracked risk.

---

## Technical Debt

| Item | Severity | Recommendation |
|------|----------|----------------|
| T-01: `MemoryRepository` ~622 lines | Medium | Deferred to Phase 11C — requires ADR-019 if structural. Not blocking cutover. |
| Staging integration test skipped | Low | Document local reproduction; ensure Phase 13 CI has live service containers |
| No E2E test at CI time for Postgres | Low | Staging harness CI job covers this when owner provisions Postgres |

---

## Impact on Phases 12–14

| Phase | Impact from Phase 11 |
|-------|---------------------|
| **12 Event Pipeline** | Redis/Otel staging target must be provisioned before Readiness PASS (per lesson above) |
| **13 Content & Vector** | pgvector cutover reuses same `ISqlDatabase` + staging harness pattern; needs live pgvector service container in CI |
| **14 Search & Graph** | Meilisearch / Neo4j production backfill follows the 11A runbook pattern; needs documented parity script |

---

## Process Observations

### Phase 11 was an operations phase, not a development phase

The ratio of **documentation to code** was unusually high (MIGRATION.md, PANDUAN §8, TESTING.md, REVIEW.md, COMPLETION.md, RETROSPECTIVE.md vs. ~8 script files). This is correct for Phase 11's purpose — but it means future **ops phases** should budget documentation time explicitly.

### Constitutional constraints enabled fast implementation

The explicit rules ("no `pg` in services", "no provider selection in repositories", "composition root only") eliminated design debates and let implementation proceed directly from the design doc.

### ADR-driven scope

ADR-018 (Approved) established the cutover strategy before implementation began. This prevented mid-phase scope discussions and gave the implementation a clear, owner-ratified target.

---

## Recommendations for Future Phases

1. **Provision staging targets before Readiness PASS** — not as a post-implementation owner action.
2. **Write runbooks first** — derive scripts from operational spec, not the reverse.
3. **Ensure live integration tests run in CI** — use service containers; avoid `@skipIf` suites that never run.
4. **Track operational phases differently** — budget 50%+ documentation time for ops phases.
5. **Apply same ADR-first approach** — Phase 13 pgvector, Phase 14 search/graph should have Approved ADRs before script implementation.

---

*Retrospective authored as part of Phase 11 gate. Subordinate to [DESIGN.md](DESIGN.md) and [ADR-018](../../../docs/adr/018-production-postgres-cutover.md).*
