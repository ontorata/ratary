# Phase 13.1 — Remote MCP Clients — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-048 Implemented](../../adr/048-remote-mcp-transport.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 13.1A | Streamable HTTP MCP route at `REMOTE_MCP_PATH` | ✅ |
| 13.1B | API-key auth via existing Fastify auth (`aic_...`) | ✅ |
| 13.1B | `McpContextBinding` — stdio vs remote scope | ✅ |
| 13.1C | Env + manifest `supportsRemoteMcp` | ✅ |
| 13.1E | Remote MCP helper tests | ✅ |

---

## File map

```
src/transport/mcp/
  mcp-context-binding.ts              stdio / remote / REST bindings
  mcp-server.ts                       refactored to McpContextBinding
  remote/
    mcp-remote-context.ts             AsyncLocalStorage session + initialize detect
    register-remote-mcp-routes.ts     Fastify /mcp GET|POST|DELETE + CORS
tests/transport/remote-mcp.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `REMOTE_MCP_ENABLED` | `false` | Master switch — route not mounted when off |
| `REMOTE_MCP_PATH` | `/mcp` | HTTP mount path |
| `REMOTE_MCP_CORS_ORIGINS` | `*` | CORS allowlist for browser MCP clients |
| `REMOTE_MCP_PUBLIC_URL` | — | Optional canonical URL in manifest |

---

## ChatGPT setup (after deploy)

1. Deploy on **long-running Node** (Railway/Fly/VPS — not Vercel serverless for SSE)
2. Set `REMOTE_MCP_ENABLED=true`
3. Issue `aic_...` API key
4. ChatGPT → New App → Server URL → `https://your-host/mcp`
5. Auth: Bearer `aic_...` (custom header if UI supports)

**Fallback:** Custom GPT Actions + OpenAPI `/docs/json` — unchanged.

---

## Invariants

- Same 20 MCP tools via `createMcpServer()` — no fork
- `MemoryService` unchanged
- MCP stdio always available regardless of `REMOTE_MCP_ENABLED`

---

## Rollback

`REMOTE_MCP_ENABLED=false` — route unmounted; stdio unaffected.
