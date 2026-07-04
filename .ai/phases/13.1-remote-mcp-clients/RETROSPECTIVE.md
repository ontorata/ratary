# Phase 13.1 — Remote MCP Clients — RETROSPECTIVE

**Phase status:** Closed  
**Recorded:** 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Streamable HTTP MCP at `/mcp`, API-key auth, OAuth RFC 9728 + OIDC bearer (13.1D). Same 20 tools; gated by `REMOTE_MCP_ENABLED=false`.

Gate PASS 2026-07-04. Evidence: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md) · [CHECKLIST.md](CHECKLIST.md).

---

## What worked well

- `McpContextBinding` — stdio vs remote without forking tools
- OAuth discovery bridge reuses Phase 17 OIDC provider
- CORS + session via AsyncLocalStorage
- ADR-048 Implemented; enables ChatGPT Server URL

---

## What was harder than expected

- ChatGPT staging smoke not in CI
- Requires long-running Node not Vercel serverless

---

## Accepted debt

- OAuth cross-depends on Phase 17 OIDC env
- No automated remote client smoke in CI

---

## Recommendations

- Record ChatGPT remote MCP smoke against staging
- CI test for `/.well-known/oauth-protected-resource/*`

---

*Recorded at gate 2026-07-04. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
