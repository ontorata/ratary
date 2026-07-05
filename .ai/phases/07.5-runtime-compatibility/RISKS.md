# Phase 7.5 — Runtime Compatibility — RISKS

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
| Manifest stale vs live flags | Medium | High | Builder reads env at request time | Mitigated |
| MCP/REST manifest drift | Medium | High | Shared handler + contract tests | Mitigated |
| Tool count mismatch | Medium | High | MCP_TOOL_NAMES SSOT + tools.test.ts | Mitigated |
| Public capabilities info leak | Low | Medium | No secrets in manifest; flags only | Mitigated |
| Agents miss capabilities without explicit call | Medium | Medium | Initialize `_meta['io.aibrain/capabilities']` + `get_capabilities` + SDK `CapabilitiesApi.get()` | ✅ Closed — D7.5-01 |
| No runtime negotiation protocol | Low | Medium | D7.5-03 REST POST + MCP initialize `_meta` + `negotiate_capabilities` | ✅ Closed |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
