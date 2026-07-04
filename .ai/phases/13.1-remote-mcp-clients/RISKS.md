# Phase 13.1 — Remote MCP Clients — RISKS

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
| Public /mcp without auth | Low | Critical | API key or OAuth required when ON | Mitigated |
| Session fixation / hijack | Medium | High | Session binding; CORS allowlist | Mitigated |
| Vercel serverless SSE break | High | High | Document long-running Node requirement | Mitigated |
| OAuth misconfiguration exposes owner | Medium | Critical | OIDC_MCP_OWNER_ID required when OAuth ON | Mitigated |

## Deferred risks (carried forward)

| ID | Risk | Mitigation path |
|----|------|-----------------|
| D131-01 | ChatGPT CI smoke | Staging manual record |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
