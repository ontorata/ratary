# Phase 7.5 — Runtime Compatibility — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Closed Phase 7 capability discovery gap: `CapabilityManifestBuilder`, `GET /api/v1/capabilities`, MCP `get_capabilities`, `MCP_TOOL_NAMES` SSOT (20 tools).

Evidence: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md) · [CHECKLIST.md](CHECKLIST.md).

---

## What worked well

- Shared handler — REST and MCP return identical manifest JSON
- `MCP_TOOL_NAMES` enforces parity via contract tests
- No new env vars — reads existing deployment flags
- ADR-025 Accepted; closes Phase 7 discovery debt D7-01

---

## What was harder than expected

- Condensed manifest in MCP `initialize` metadata not built
- Remote capability negotiation handshake deferred → **closed D7.5-03**

---

## Accepted debt

| ID | Item | Mitigation | Status |
|----|------|------------|--------|
| D7.5-01 | Full manifest requires explicit capabilities call | Optional condensed `serverInfo` snapshot | ✅ Closed — `_meta['io.aibrain/capabilities']` on initialize |
| D7.5-02 | External SDK name drift (`@ratary/client`) | Phase 16 `@ratary/sdk` in monorepo | ✅ Closed |
| D7.5-03 | No runtime negotiation protocol | Pull manifest; handshake deferred | ✅ Closed — REST POST + MCP initialize `_meta` + `negotiate_capabilities` |

---

## Recommendations

- D7.5-01: embed condensed snapshot in MCP `initialize` `serverInfo` (Phase 13.1 follow-up)
- D7.5-02: ✅ `@ratary/sdk` `CapabilitiesApi.get()` consumes manifest (Phase 16)
- D7.5-03: ✅ REST `POST /capabilities/negotiate` + MCP initialize negotiation `_meta` + `negotiate_capabilities` tool

---

*Recorded at gate 2026-07-04. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
