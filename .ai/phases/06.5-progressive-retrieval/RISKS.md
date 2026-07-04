# Phase 6.5 — Progressive Retrieval — RISKS

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
| Policy breaks summary-only default | Medium | High | DefaultRetrievalPolicy matches pre-6.5 behavior | Mitigated |
| Client ignores retrievalPlan | Low | Low | Additive response field; optional | Accepted |
| Token budget miscalculation | Medium | Medium | Unit tests; benchmark deferred | Identified |
| Relations stage incomplete | Medium | Medium | Stage defined; auto-expand deferred | Deferred |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
