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

## Deferred risks (carried forward)

| ID | Risk | Mitigation path |
|----|------|-----------------|
| D85-01 | MCP submit_signal | Phase 13.1 remote path |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
