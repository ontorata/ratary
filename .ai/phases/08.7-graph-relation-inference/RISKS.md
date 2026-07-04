# Phase 8.7 — Graph Relation Inference — RISKS

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
| Inferred edge overwrites manual | Low | Critical | upsertInferred skips manual edges | Mitigated |
| Inference runaway O(n²) | Medium | Medium | Batch CLI only; caps in orchestrator | Mitigated |
| False positive relations | Medium | Medium | Rule-based sources; evidence store audit | Accepted |
| Stale inferred edges when OFF | Medium | Low | No auto cleanup when flag disabled | Accepted |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
