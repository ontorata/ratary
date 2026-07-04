# Task Prompt — Phase 11 Production Operations

**Handoff (Cline / VS Code):** [HANDOFF.md](phases/11-production-ops/HANDOFF.md) — session state + starter prompt (2026-07-03)

**Status:** 🔄 In Progress — Design Approved (2026-07-03); implementation complete; SC-11-01 + SC-11-05 pending owner action  
**Template:** [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md)  
**Roadmap:** [phases/roadmap/10-POST-ROADMAP.md](phases/roadmap/10-POST-ROADMAP.md)

---

# TASK

**Phase 11 — Production Operations** (P0 post–Phase 10)

**Objective:** Prove Postgres metadata path in staging; produce cutover runbook. Default D1 deploy unchanged.

**Do not implement until:** Readiness PASS. ADR-018 ✅ Approved (2026-07-03).

---

## ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [018](../../../docs/adr/018-production-postgres-cutover.md) | Production Postgres cutover | ✅ **Approved** (2026-07-03) |

---

## Milestones (from POST-ROADMAP)

- [x] ADR-018 Approved (2026-07-03)
- [x] Phase 11 folder scaffolded (`11-production-ops/`)
- [x] DESIGN + RISKS + Readiness Review PASS (conditional)
- [x] C11-1..C11-6: runPostgresMigrations, apply-postgres-schema, backfill, parity scripts, CI harness
- [x] C11-7: MIGRATION.md cutover runbook
- [x] C11-8: PANDUAN §8 + README ops matrix
- [ ] Staging CI/job: `SQL_PROVIDER=postgres` full test suite
- [ ] Gate REVIEW PASS

---

## Definition of Done

- [ ] Staging evidence for Postgres metadata adapter
- [ ] Owner sign-off on cutover strategy
- [ ] 405+ tests green at default env (D1)
- [ ] No service-layer rewrite

---

## Parallel tracks (later phases — not Phase 11)

| Phase | Focus |
|-------|--------|
| 12 | Event pipeline, audit fan-out, OTel runbook |
| 13 | R2 content offload, pgvector production |
| 14 | Meilisearch / Neo4j production |

---

*Rotated from post–Phase 10 roadmap definition 2026-07-03.*
