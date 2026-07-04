# Phase 8.5 — Quality Signals — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Agent learning loop in repo | Low | Critical | Ingest only; constitution §55 | Mitigated |
| Importance score manipulation | Medium | Medium | Bounded deltas; auth on REST ingest | Mitigated |
| Signal store PII growth | Medium | Medium | Typed signals; no raw chat dump | Mitigated |
| Ranking auto-mutation | Medium | High | RANKING_ADAPTATION_ENABLED=false default | Mitigated |
| Signal ingest without MCP | Medium | Low | REST `POST /api/v1/signals` — **D85-01** | Accepted |
| Learning bus vs store split | Low | Medium | **8.6** store bridge mitigates; **D85-02** bus open | Accepted |
| Rank order untested E2E | Low | Low | Unit policy + ingest — **D85-04** | Accepted |

## Deferred risks (carried forward)

| ID | Risk | Mitigation path | Status |
|----|------|-----------------|--------|
| D85-01 | MCP submit_signal gap | REST ingest → Phase **13.1** | ⏳ Open |
| D85-02 | No event bus fan-out on ingest | **8.6** learning store + Phase 12 publisher | ⏳ Open |
| D85-03 | Ranking adaptation stub | Hot-path bumpImportance; CLI dry-run | ⏳ Open |
| D85-04 | Rank order E2E gap | Unit tests | ⏳ Open |
| D85-05 | REST E2E signals | Composition test + staging | ⏳ Open |
| D85-06 | lifecycleState API | importance / access_count | ⏳ Open |

---

*Gate PASS 2026-07-04. Post-gate mitigations appended 2026-07-04.*
