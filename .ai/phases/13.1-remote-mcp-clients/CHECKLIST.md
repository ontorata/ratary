# Phase 13.1 — Remote MCP Clients — CHECKLIST

**Phase status:** 🔲 Planned — design draft (2026-07-04)  
**Design:** [DESIGN.md](DESIGN.md)

---

## Readiness

### A — Governance

- [ ] ADR-048 **Approved** (remote MCP transport)
- [x] Phase 10.5 MCP stdio Implemented
- [x] Phase 3 Auth (`aic_...`) Implemented
- [ ] Owner authorization to open Phase 13.1

### B — Dependencies

- [x] `createMcpServer` + shared handlers
- [x] `GET /api/v1/capabilities`
- [ ] Long-running deploy target identified (non-Vercel for SSE)
- [ ] ChatGPT MCP URL format verified against MCP SDK transport

### C — Interim documentation

- [x] PANDUAN ChatGPT REST Actions path documented
- [ ] PANDUAN remote MCP section (post-implementation)

---

## Implementation (when authorized)

- [ ] 13.1A — `McpRemoteTransportServer` + `/mcp` route
- [ ] 13.1B — API key auth middleware
- [ ] 13.1C — ChatGPT setup runbook in PANDUAN
- [ ] 13.1E — stdio vs remote tool parity tests
- [ ] `REMOTE_MCP_ENABLED=false` default
- [ ] Manifest `supportsRemoteMcp`
- [ ] IMPLEMENTATION.md · TESTING.md authored

---

## Gate

- [ ] REVIEW.md PASS
- [ ] COMPLETION.md evidence
- [ ] RETROSPECTIVE.md
- [ ] Staging ChatGPT connection smoke test recorded

*Frozen at gate PASS.*
