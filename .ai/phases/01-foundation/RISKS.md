# Phase 1 — Foundation — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-06-28  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| D1 vendor coupling | Medium | High | Repository port abstraction; migration scripts | Accepted — mitigated in Phase 10 |
| No authentication on REST | High | Critical | Phase 3 authorization scope | Resolved — Phase 3 |
| MCP/REST semantic drift | Medium | High | Shared MemoryService; single repository | Mitigated |
| Schema migration on live data | Medium | High | Forward-only migrations; idempotent runner | Mitigated |

---

*Gate PASS 2026-06-28 — realized risks locked; deferred items tracked above or in CHECKLIST.*
