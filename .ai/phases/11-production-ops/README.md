# Phase 11 — Production Operations

**Status:** ✅ Implemented · Gate PASS (2026-07-04)  
**Roadmap:** [10-POST-ROADMAP.md — Phase 11](../roadmap/10-POST-ROADMAP.md)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**ADR:** [ADR-018 Approved](../../../docs/adr/018-production-postgres-cutover.md)

---

## Summary

Prove Postgres metadata path in staging and deliver a **reversible production cutover runbook** — without changing default D1 deploy or application services.

| Track | Deliverable |
|-------|-------------|
| 11A | D1→Postgres backfill + parity scripts + `MIGRATION.md` runbook |
| 11B | Staging harness — schema bootstrap + CI + integration tests |
| 11C | `MemoryRepository` split | ⏸️ Deferred (optional ADR-019) |
| 11D | PANDUAN §8 + ops env matrix |

**Default:** `SQL_PROVIDER=d1` unchanged. Postgres is opt-in via `SQL_PROVIDER=postgres` + `DATABASE_URL`.

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Approved design intent |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, commit plan, file map |
| [MIGRATION.md](MIGRATION.md) | Cutover S0→S4, rollback, FK order |
| [TESTING.md](TESTING.md) | Gate evidence, suite inventory |
| [CHECKLIST.md](CHECKLIST.md) | Readiness + gate checklist |
| [REVIEW.md](REVIEW.md) | Architecture review + owner sign-off |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned |
| [RISKS.md](RISKS.md) | Risk register |

---

## Quick start

```bash
# Default — D1 (unchanged)
npm test

# Postgres schema bootstrap (staging / cutover prep)
export SQL_PROVIDER=postgres
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_brain_dev
npm run db:apply-postgres-schema

# Staging integration tests (requires live Postgres)
export POSTGRES_STAGING=1
npm run test:postgres-staging

# Backfill D1 → Postgres (dry-run default)
npm run db:backfill-d1-to-postgres

# Verify row-count parity
npm run db:verify-postgres-parity
```

Full cutover procedure: [MIGRATION.md](MIGRATION.md). Human ops guide: [docs/PANDUAN.md §8](../../../docs/PANDUAN.md).

---

## Non-goals

- `MemoryService` / `Retriever` rewrite
- Application-level dual-write
- Automatic production cutover in deploy pipeline
- Vector/search/graph provider migration (Phases 12–14)

---

## Related

- Phase 10 Enterprise adapters: [10-enterprise](../10-enterprise/README.md)
- Phase 10.5 Transport: [10.5-transport-connectivity](../10.5-transport-connectivity/README.md)
- Phase 12 Event Pipeline: [12-event-pipeline](../12-event-pipeline/README.md) *(Implemented — ADR-020)*
