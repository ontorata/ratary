# Phase 14 — Federation — RISKS

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
| MemoryService rewrite pressure | Low | Critical | IKnowledgeExchangeService only — ADR-029 | Mitigated |
| Cross-org data leak | Low | Critical | Fail-closed policy; trust store | Mitigated |
| Bundle PII over federation wire | Medium | Critical | Policy filterExportable; content limits | Mitigated |
| In-process transport only | High | Medium | MVP same-node; remote transport deferred | Accepted |
| Conflict storms multi-node | Medium | Medium | LWW default; cursor metadata store | Mitigated |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
