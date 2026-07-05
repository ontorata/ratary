# Phase 3 — Authorization — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-06-30  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| API key leak in logs | Medium | Critical | Never log raw keys; hash/compare only | Mitigated |
| Missing auth on new routes | Medium | Critical | Fastify auth plugin; E2E 401 tests | Mitigated |
| Owner ID spoofing | Low | Critical | Key binds owner; no header override | Mitigated |
| MCP env owner misconfiguration | Medium | High | Document MCP_OWNER_ID required in prod | Mitigated |

---

*Gate PASS 2026-06-30 — realized risks locked; deferred items tracked above or in CHECKLIST.*
