# Phase 13.1 — Remote MCP Clients — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Remote MCP helpers | `tests/transport/remote-mcp.test.ts` | initialize detection, binding exports |
| MCP tool parity | `tests/mcp/tools.test.ts` | stdio 20 tools via `createStdioMcpBinding` |

---

## Manual smoke (staging)

1. `REMOTE_MCP_ENABLED=true npm run dev`
2. POST `/mcp` with `Authorization: Bearer aic_...` and MCP initialize JSON-RPC
3. Follow-up requests with `mcp-session-id` header
4. Call `search_memory` tool — compare with Cursor stdio outcome

---

## Known constraints

- Vercel serverless: REST Actions OK; remote MCP SSE sessions **not recommended**
- OAuth (ChatGPT dropdown): deferred to Phase 17
