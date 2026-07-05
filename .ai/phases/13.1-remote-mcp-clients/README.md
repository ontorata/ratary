# Phase 13.1 — Remote MCP Clients (ChatGPT & Web)

**Status:** ✅ Implemented (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Parent:** [Phase 13 Protocol Layer](../13-protocol-layer/README.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 13.1  
**ADR:** [ADR-048 Implemented](../../adr/048-remote-mcp-transport.md)

---

## Summary

Enable **cloud AI clients** (ChatGPT Custom MCP, Claude.ai web, future remote MCP hosts) to connect to Ratary via a **public HTTPS MCP endpoint** — without stdio spawn.

| Track | Deliverable | Default |
|-------|-------------|---------|
| **13.1A** | MCP Streamable HTTP / SSE transport on server | `REMOTE_MCP_ENABLED=false` |
| **13.1B** | API-key auth at MCP boundary (reuse `aic_...`) | required when ON |
| **13.1C** | ChatGPT setup runbook + OpenAPI Actions interim path | docs |
| **13.1D** | MCP OAuth discovery + OIDC bearer at `/mcp` (Phase 17 bridge) | ✅ |
| **POST-MVP** | ChatGPT initialize CI smoke (`remote-mcp-chatgpt-smoke.test.ts`) | ✅ D131-01 |

**Interim (no code):** Custom GPT **Actions** via REST + `aic_...` — documented in [PANDUAN.md](../../../docs/PANDUAN.md) until 13.1 ships.

---

## Problem

| Client | Transport today | Gap |
|--------|-----------------|-----|
| Cursor, Claude Code, Roo | MCP **stdio** (local process) | ✅ works |
| **ChatGPT "New App"** | MCP **Server URL** (HTTPS + SSE) | ❌ no endpoint |
| Claude.ai / web MCP hosts | Remote URL | ❌ same gap |

PANDUAN currently states: *"ChatGPT — MCP stdio tidak didukung — pakai REST API"*. Phase 13.1 closes the **remote MCP** gap while keeping REST Actions as fallback.

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ N/A (no DDL) or prior phase |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04.*


---

## Prerequisites

| Dependency | Status |
|------------|--------|
| Phase 10.5 Transport (`createMcpServer`, shared handlers) | ✅ Implemented |
| Phase 3 Auth (`aic_...` API keys) | ✅ Implemented |
| Phase 7.5 Capabilities manifest | ✅ Implemented |
| Phase 13 Protocol Layer (SSE, WS, stream) | ✅ Implemented |
| Phase 17 Enterprise Security (OIDC SSO) | ✅ REST `/auth/sso/*` + MCP OAuth bridge (13.1D) |

---

## Distinct from Phase 16

| Concern | Phase 13.1 | Phase 16 |
|---------|------------|----------|
| Location | **In-repo** server route `/mcp` | **`@ratary/mcp-server`** npm package |
| Role | Host MCP for ChatGPT URL field | Installable proxy for self-hosters |
| Business logic | None — same MCP tool registry | None — SDK client only |

Phase 16 MCP package MAY wrap 13.1 endpoint or REST; 13.1 is the **server-side transport** ChatGPT connects to.

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md).*
