# Task Prompt — Phase 13.1 Remote MCP Clients

**Phase:** 13.1 — Remote MCP Clients (ChatGPT & Web)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-048](../../adr/048-remote-mcp-transport.md)  
**Status:** Draft — execute only after ADR-048 **Approved**

---

## Goal

Implement **remote MCP transport** on the existing Fastify server so ChatGPT **New App → Server URL** can connect to Ratary with the **same 20 tools** as Cursor stdio — without changing `MemoryService`, repositories, or MCP tool schemas.

---

## Constraints

- `REMOTE_MCP_ENABLED=false` by default
- Reuse `createMcpServer()` and `createTransportHandlers()` — no duplicated tool logic
- Auth: `Authorization: Bearer aic_...` (Phase 3 identity layer)
- MCP stdio path **unchanged**
- No OAuth in MVP (document deferral to Phase 17)
- Document Vercel/serverless SSE limitation

---

## Deliverables

1. `src/transport/mcp/remote/` — remote transport adapter
2. Fastify route `/mcp` (configurable via `REMOTE_MCP_PATH`)
3. Wire in `buildApp()` or transport registry when flag ON
4. Env: `REMOTE_MCP_ENABLED`, `REMOTE_MCP_PATH`, `REMOTE_MCP_CORS_ORIGINS`, `REMOTE_MCP_PUBLIC_URL`
5. Manifest: `supportsRemoteMcp`
6. Tests: remote session auth reject; tool parity vs stdio fixture
7. Docs: PANDUAN ChatGPT section (Remote MCP + Actions fallback)
8. `.ai/phases/13.1-*` gate docs on completion

---

## Out of scope

- `@ratary/mcp-server` npm package (Phase 16)
- OAuth for ChatGPT
- New MCP tools or breaking schema changes

---

## Quality gate

```bash
npm run typecheck && npm run lint && npm test
```

Manual: ChatGPT New App → staging URL → `search_memory` smoke test.
