# Phase 13.1 — Remote MCP Clients — CHECKLIST

**Phase status:** ✅ Implemented (2026-07-04)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-048 Implemented](../../adr/048-remote-mcp-transport.md)

---

## Readiness

### A — Governance

- [x] ADR-048 **Approved** → Implemented
- [x] Phase 10.5 MCP stdio Implemented
- [x] Phase 3 Auth (`aic_...`) Implemented

### B — Dependencies

- [x] `createMcpServer` + shared handlers
- [x] `GET /api/v1/capabilities`
- [x] MCP SDK Streamable HTTP transport verified

### C — Documentation

- [x] PANDUAN ChatGPT REST Actions path documented
- [x] IMPLEMENTATION.md · TESTING.md authored

---

## Implementation

- [x] 13.1A — `registerRemoteMcpRoutes` + `/mcp` route
- [x] 13.1B — API key auth via Fastify auth layer
- [x] 13.1C — Env + manifest `supportsRemoteMcp`
- [x] 13.1E — remote MCP helper tests
- [x] `REMOTE_MCP_ENABLED=false` default

---

## Gate

- [ ] REVIEW.md PASS
- [ ] Staging ChatGPT connection smoke test recorded

*Frozen at gate PASS.*
