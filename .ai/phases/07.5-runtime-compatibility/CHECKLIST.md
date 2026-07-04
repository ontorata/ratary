# Phase 7.5 — Runtime Compatibility — CHECKLIST

**Phase status:** ✅ Implemented (2026-07-04) · ADR-025 Accepted  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-025](../../../docs/adr/025-capability-discovery-api.md)

---

## Implementation tracks

- [x] **7.5A** — `AICapabilityManifest` types + constants
- [x] **7.5B** — `CapabilityManifestBuilder` (env-derived flags)
- [x] **7.5C** — `MCP_TOOL_NAMES` registry SSOT
- [x] **7.5D** — `GET /api/v1/capabilities` + OpenAPI tag
- [x] **7.5E** — MCP `get_capabilities` tool
- [x] **7.5F** — Contract tests + composition root + docs

---

## Testing

- [x] Manifest builder unit tests
- [x] Manifest contract tests (tool parity, transport)
- [x] REST API E2E test
- [x] Composition ports test
- [x] MCP tools registry test

---

## Documentation

- [x] DESIGN.md — Implemented, success criteria checked
- [x] IMPLEMENTATION.md, README.md, TESTING.md, CHECKLIST.md
- [x] ADR-025 — Accepted with implementation section

---

## Deferred

| ID | Item | Status | Owner / notes |
|----|------|--------|---------------|
| D7.5-01 | Condensed manifest in MCP `initialize` `serverInfo` metadata | ✅ Closed | **D7.5-01** — `_meta['io.aibrain/capabilities']` + `serverInfo.description` + `instructions`; full manifest remains `get_capabilities` / REST |
| D7.5-02 | Client SDK package | ✅ Closed | **Phase 16** (ADR-031) — `@ai-brain/sdk` in `packages/sdk` + language wrappers; supersedes external `@ai-brain/client` name from Phase 7.5 DESIGN |
| D7.5-03 | Remote capability negotiation handshake | ✅ Closed | **D7.5-03** — `POST /api/v1/capabilities/negotiate`, MCP `negotiate_capabilities`, initialize `_meta['io.aibrain/capabilities-request'|'capabilities-negotiation']` |

### Checklist (frozen at gate)

- [x] D7.5-01 — Condensed manifest in MCP `initialize` `serverInfo` metadata
- [x] D7.5-02 — Client SDK — `@ai-brain/sdk` (Phase 16; was `@ai-brain/client` in DESIGN)
- [x] D7.5-03 — Remote capability negotiation handshake

**Mitigation while open:** agents call `get_capabilities` or `GET /api/v1/capabilities` explicitly; SDK `CapabilitiesApi.get()` (Phase 16).

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — Implemented 2026-07-04 |
| **ADR** | ADR-025 Accepted |
