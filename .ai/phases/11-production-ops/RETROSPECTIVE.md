# Phase 11 — Production Operations — RETROSPECTIVE

**Document:** RETROSPECTIVE
**Phase status:** In Progress — Design Approved; staging pending
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

### Staging Postgres target

Phase 11 ships the CI harness (`.github/workflows/postgres-staging.yml`) but cannot complete the full gate (SC-11-01) until a **live Postgres instance** is provided. This is an owner action, not an implementation gap — but it means the CI job has never been run against a real Postgres database before Phase 11 close.

**Lesson:** Future infrastructure phases should include a **provisioned staging environment** as a prerequisite gate, not as a post-implementation owner action.

**Action:** Phase 12 (Event Pipeline) and Phase 13 (Content & Vector) should provision their staging targets before declaring Readiness PASS.

### No integration test at CI time

The `postgres-staging.integration.test.ts` suite is `@skipIf(!stagingEnabled)` — skipped in normal CI. The unit tests (mock-based) pass, but the live adapter integration test only runs when `POSTGRES_STAGING=1`. This means dialect translation bugs in `PostgresSqlDatabaseAdapter` could surface only at cutover time.

**Lesson:** Integration tests that require live external services should either:
1. Be runnable in CI via service containers (as the harness does), or
2. Have a documented local reproduction path that is **not** skipped in normal CI.

**Action:** For Phase 13 pgvector cutover, ensure the vector integration suite runs in CI via a `pgvector` service container, not as a skipped suite.

### MIGRATION.md came late in the sequence

The cutover runbook was drafted after the scripts landed, rather than in parallel with implementation. While the scripts were self-documenting, deriving the runbook from implementation (rather than driving implementation from the runbook) risked minor gaps.

**Lesson:** For operational proof phases, **write the runbook first** (as a specification), then implement scripts to satisfy it.

**Action:** Phase 12 and beyond — author `MIGRATION.md` at the same time as script implementation, not after.

---

## Risks That Did Not Materialize

| Risk | Mitigation | Outcome |
|------|-----------|---------|
| R11-01 Schema drift D1 ↔ Postgres | Shared `MIGRATION_SQL`; `runSchemaMigrations(client, 'postgres')` | ✅ Did not drift — same DDL source |
| R11-03 Staging not representative | Full `npm test` harness | 🔲 Pending — harness ready but not yet run |
| R11-05 Default D1 regression | 420-test baseline unchanged | ✅ No regression |
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
