# Phase 11 — Production Operations — CHECKLIST

**Phase status:** ✅ Ready — Design Approved (2026-07-03); live-Postgres staging pending  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Workflow:** [04-PHASE-READINESS.md](../../workflow/review/04-PHASE-READINESS.md)

---

## Readiness Review (Phase 10 → Phase 11)

### A — Governance

- [x] [constitution/INDEX.md](../../core/constitution/INDEX.md) — authority chain verified for Phase 11 scope
- [x] Phase 10 **PASS** recorded — [10-enterprise/REVIEW.md](../10-enterprise/REVIEW.md) (2026-07-03)
- [x] [10-enterprise/RETROSPECTIVE.md](../10-enterprise/RETROSPECTIVE.md) completed
- [x] [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) — Phase 11 scope read; Phase 10 closed

### B — Dependencies

- [x] Hard dependency Phase 10 ✅ — gate PASS, ADR-005–017 Implemented
- [x] `PostgresSqlDatabaseAdapter` landed (ADR-009 Implemented)
- [x] Phase 10 success criteria verified — default D1 deploy unchanged; 405+ tests at default env (audit 2026-07-03)
- [x] No blocking debt from Phase 10 retrospective — T-01 (`MemoryRepository` split) deferred to optional 11C

### C — ADR gates

- [x] [ADR-018](../../../docs/adr/018-production-postgres-cutover.md) — **Approved** (2026-07-03)
- [x] [ADR-009](../../../docs/adr/009-postgresql-metadata-adapter.md) — **Implemented**
- [x] No Proposed/Draft ADRs required for Phase 11 core scope
- [x] ADR-019 (optional 11C split) — not required at open

### D — Extension points

- [x] `ISqlDatabase` port — `src/ports/sql/isql-database.port.ts`
- [x] `PostgresSqlDatabaseAdapter` — `src/infrastructure/sql/postgres-sql-database.adapter.ts`
- [x] `createSqlDatabase()` / `createPlatformAdapters()` — composition root wiring exists
- [x] `MemoryRepository` depends on `ISqlDatabase` — not `D1Client`
- [x] Backfill CLI patterns — `scripts/lib/backfill-sql.ts`, `scripts/lib/backfill-cli.ts`
- [x] Reuse assessment — extend scripts + CI harness; no new service layer ([13-AI-DECISION-FRAMEWORK.md](../../core/decision-framework/13-AI-DECISION-FRAMEWORK.md))
- [x] No **BLOCKER** conflict logged in Phase 10 retrospective for Postgres cutover

### E — Impact preview

| Area | Assessed | Notes |
|------|----------|-------|
| Migration | Yes | Postgres schema bootstrap + D1→Postgres backfill scripts; D1 DDL canonical unchanged |
| REST API | None | No contract change |
| MCP | None | No tool schema change |
| Tests | Yes | New Postgres staging job; default `npm test` baseline unchanged |
| Performance | Low | Adapter already thin; harness validates full suite |
| Security | Yes | `DATABASE_URL` secrets only; [SECURITY.md](../../core/supplementary/SECURITY.md) |
| Rollback | Yes | Env flip `SQL_PROVIDER=d1`; data boundary in ADR-018 |

### F — Authorization

- [x] [TASK_PROMPT.md](../../TASK_PROMPT.md) rotated to Phase 11
- [x] Phase folder scaffolded — `11-production-ops/` (README, DESIGN, RISKS)
- [x] Owner explicit authorization recorded — DESIGN.md approved 2026-07-03
- [x] Implementation complete — all scripts, CI, docs delivered

---

## Readiness decision record

| Field | Value |
|-------|-------|
| **Closing phase** | 10 — Enterprise |
| **Opening phase** | 11 — Production Operations |
| **Date** | 2026-07-03 |
| **Reviewer** | AI assistant (implementation); owner for cutover sign-off |
| **Verdict** | **CONDITIONAL PASS** — infrastructure ready; SC-11-01 + SC-11-05 pending owner action |
| **ADR gates** | ADR-018 ✅ Approved · ADR-009 ✅ Implemented |
| **Conditions** | (1) Owner provides staging Postgres target (DATABASE_URL) for CI harness; (2) Owner records cutover sign-off in REVIEW.md |
| **Authorized** | ✅ Design Approved (2026-07-03). Production cutover authorized per ADR-018 after staging harness PASS. |

---

## §1 — Design

- [x] Phase scope matches [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) Phase 11
- [x] Dependency phases complete and Phase Gate passed
- [x] Structural change has **Approved** ADR (ADR-018)
- [x] Extend vs new module decided — scripts + CI only; no service rewrite
- [x] Backward compatibility — `SQL_PROVIDER=d1` default unchanged
- [x] Future phase compatibility — Phases 12–14 orthogonal (vector, events, search)
- [x] [TASK_PROMPT.md](../../TASK_PROMPT.md) rotated
- [x] [DESIGN.md](DESIGN.md) — Approved (owner authorization recorded 2026-07-03)

---

## §2 — Implementation

- [x] `runPostgresMigrations` + `runSchemaMigrations` (C11-1)
- [x] `scripts/apply-postgres-schema.ts` (C11-2)
- [x] `scripts/backfill-d1-to-postgres.ts` (C11-5)
- [x] `scripts/verify-postgres-parity.ts` (C11-6)
- [x] Staging harness (C11-4): `.github/workflows/postgres-staging.yml` + integration tests
- [x] [IMPLEMENTATION.md](IMPLEMENTATION.md) authored
- [x] [MIGRATION.md](MIGRATION.md) cutover runbook (C11-7)
- [x] Composition root unchanged — no service rewrite
- [x] One concern per commit — implemented per commits 939b996–5bb0ba5

---

## §3 — Tests

- [ ] Postgres staging job: full `npm test` green *(requires live Postgres — owner-provided staging target)*
- [ ] Schema bootstrap idempotency test on live Postgres *(staging integration suite)*
- [x] Backfill dry-run + round-trip tests (`tests/scripts/d1-to-postgres-backfill.test.ts`) ✅
- [x] Default env 420 tests green (`SQL_PROVIDER=d1`) ✅
- [x] `cross-owner-leak` / `cross-workspace-leak` / `cross-org` verified at D1 baseline ✅
- [x] [TESTING.md](TESTING.md) authored ✅

---

## §4 — Architecture Review

- [x] Matches [DESIGN.md](DESIGN.md) + ADR-018 — no unauthorized scope ✅
- [x] No `pg` imports outside `src/infrastructure/` ✅
- [x] No provider selection in repositories ✅
- [x] Rollback documented in [MIGRATION.md](MIGRATION.md) ✅

---

## §5 — Phase Gate

- [x] §1 Design ✅
- [x] §2 Implementation ✅
- [x] §3 Unit tests + TESTING.md ✅ *(live-Postgres integration pending)*
- [x] §4 Architecture review ✅
- [x] [COMPLETION.md](COMPLETION.md) ✅
- [x] [REVIEW.md](REVIEW.md) — Conditional PASS ✅
- [x] [RETROSPECTIVE.md](RETROSPECTIVE.md) ✅
- [x] [TESTING.md](TESTING.md) ✅
- [ ] [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) Phase 11 marked ✅ *(owner)*
- [ ] SC-11-01: Live-Postgres staging harness green *(owner)*
- [ ] SC-11-05: Owner cutover sign-off recorded *(owner)*

---

## Milestones

- [x] ADR-018 Approved ✅ (2026-07-03)
- [x] Phase 11 folder scaffolded ✅
- [x] DESIGN + RISKS drafted ✅
- [x] Readiness Review PASS (conditional) ✅
- [x] `runPostgresMigrations` + schema scripts ✅
- [x] Backfill + parity scripts + `MIGRATION.md` ✅
- [x] Staging CI workflow ✅
- [x] TESTING.md authored ✅
- [x] COMPLETION.md + RETROSPECTIVE.md authored ✅
- [x] DESIGN.md ✅ Ready — Owner Approved (2026-07-03)
- [ ] SC-11-01: Staging CI: `SQL_PROVIDER=postgres` full test suite green *(live Postgres required)*
- [ ] SC-11-05: Owner cutover sign-off recorded
- [ ] [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) Phase 11 marked ✅

---

*Readiness assessed 2026-07-03. Implementation authorized per ADR-018 after conditions tracked.*
