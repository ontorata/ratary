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
| Signal ingest without MCP | Medium | Low | REST path + Phase 13.1 MCP deferred | Accepted — D85-01 |
| Learning bus vs store split | Low | Medium | 8.6 store bridge; 12 bus D85-02 open | Accepted |

## Deferred risks (carried forward)

| ID | Risk | Mitigation path | Status |
|----|------|-----------------|--------|
| D85-01 | MCP submit_signal gap | Phase 13.1 remote MCP | Open |
| D85-02 | No event bus fan-out on ingest | Phase 12 publisher | Open |
| D85-03 | Ranking adaptation stub | Explicit flag + CLI dry-run | Open |

---

*Gate PASS 2026-07-04. Post-gate mitigations appended 2026-07-04.*
