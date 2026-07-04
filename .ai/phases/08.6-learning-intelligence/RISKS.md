# Phase 8.6 — Learning Intelligence — RISKS

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
| Ranking snapshot wrong owner | Medium | Critical | Scope on snapshot loader; context tests | Mitigated |
| Stub engines side effects | Low | High | No-op stubs L23–L30 when disabled | Mitigated |
| Batch learning stale data | Medium | Medium | Manual `learning:run`; 04.7 stewardship mitigates | Accepted — D86-05 partial |
| Requires signal ingest ON | Medium | Medium | Document dependency on Phase 8.5 | Mitigated |
| Stub engines accidentally wired | Low | High | No-op implementations; composition tests | Mitigated |

## Deferred risks (carried forward)

| ID | Risk | Mitigation path | Status |
|----|------|-----------------|--------|
| D86-01 | No recommendation surface | L24 engine + REST | Open |
| D86-03 | No ML / eval loop | L28–L30 roadmap | Open |
| D86-04 | Rank order E2E unproven | Cross-phase integration test | Open |

---

*Gate PASS 2026-07-04. Post-gate mitigations appended 2026-07-04.*
