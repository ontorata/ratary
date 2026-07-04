# Phase 13.1 — Remote MCP Clients — DESIGN

**Document:** DESIGN  
**Phase status:** 🔲 Planned — design draft (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**ADR gate:** [ADR-048](../../adr/048-remote-mcp-transport.md) — **Proposed**

---

## 1. Purpose

ChatGPT and other **browser/cloud AI products** expose MCP integration via a **Server URL** (HTTPS + SSE / Streamable HTTP) — not local stdio. AI Memory Cloud today only ships **MCP stdio** (`src/mcp/stdio.ts`) for IDE clients.

Phase 13.1 adds an **opt-in remote MCP transport** on the existing Fastify server so users can paste a URL like:

```
https://your-host.example.com/mcp
```

into ChatGPT **New App → Server URL**, with the **same 20 MCP tools** and shared handlers as Cursor.

---

## 2. Scope

### In scope

| Track | Deliverable | Hot-path impact |
|-------|-------------|-----------------|
| **13.1A** | `McpRemoteTransportServer` — Streamable HTTP + SSE per MCP spec | None — new route only |
| **13.1A** | Route prefix `/mcp` (configurable) on REST transport | Additive |
| **13.1B** | Auth: `Authorization: Bearer aic_...` or `X-API-Key` at MCP session | Reuse Phase 3 |
| **13.1B** | Scope resolution from API key identity → `MCP_OWNER_ID` equivalent | Same as REST |
| **13.1C** | Runbook: ChatGPT New App, Custom GPT Actions fallback | Docs |
| **13.1C** | Manifest flag `supportsRemoteMcp` | Additive |
| **13.1E** | Contract tests: stdio vs remote same tool outcomes | Test only |

### Out of scope

| Item | Owner phase |
|------|-------------|
| OAuth / ChatGPT OAuth auto-discovery production | Phase 17 |
| `@ai-brain/mcp-server` npm installable proxy | Phase 16 |
| MCP tool signature changes | Forbidden |
| Business logic in transport | Forbidden |
| Agent runtime inside repo | Forbidden |

### Interim path (until 13.1 ships)

**Custom GPT Actions** — REST OpenAPI import + `aic_...` key. Documented in [PANDUAN.md](../../../docs/PANDUAN.md). No server change required.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Remote MCP clients (ChatGPT, Claude.ai web, future hosts)       │
│  HTTPS → Server URL field                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ MCP JSON-RPC over Streamable HTTP/SSE
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  transport/mcp/remote/                                           │
│  McpRemoteTransportServer  ←→  @modelcontextprotocol/sdk       │
│  SSEServerTransport / StreamableHTTPServerTransport              │
└────────────────────────────┬────────────────────────────────────┘
                             │ same createMcpServer() instance
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  transport/shared/handlers/  (unchanged)                         │
│  MemoryService │ ContextService │ GraphService │ …               │
└─────────────────────────────────────────────────────────────────┘

Parallel path (IDE clients — unchanged):
  Cursor → stdio → src/mcp/stdio.ts → createMcpServer()
```

### Layer law

| Layer | Must | Must NOT |
|-------|------|----------|
| Remote MCP adapter | Wire MCP session, auth hook, CORS | SQL, repository, ranking logic |
| `createMcpServer` | Register tools, delegate to handlers | Know HTTP vs stdio |
| Handlers | Call services with `ProtocolContext` | Import MCP SDK types |

---

## 4. Ports & modules (planned)

| Artifact | Location | Role |
|----------|----------|------|
| `IRemoteMcpSessionAuth` | `transport/mcp/remote/` | Map Bearer `aic_...` → owner scope |
| `McpRemoteTransportServer` | `transport/mcp/remote/` | Fastify plugin; implements `ITransportServer` |
| `createRemoteMcpRoutes` | `transport/mcp/remote/` | Register `/mcp` (+ optional `/mcp/sse`) |
| `RemoteMcpAuthMiddleware` | `transport/mcp/remote/` | Reject unauthenticated when flag ON |
| Composition | `startTransports()` or `buildApp()` | Register when `REMOTE_MCP_ENABLED=true` |

**Reuse:** `createMcpServer(handlers, scopeResolver, …)` from Phase 10.5 — **no fork** of tool definitions.

---

## 5. Auth model

### Phase 13.1 (MVP)

| Method | Header | Notes |
|--------|--------|-------|
| API Key (primary) | `Authorization: Bearer aic_...` | Same as REST |
| API Key (alt) | `X-API-Key: aic_...` | ChatGPT may send either |
| Session | MCP `initialize` after auth middleware | Owner from identity row |

**Not in MVP:** ChatGPT OAuth auto-flow (UI shows OAuth dropdown — document "use API key via proxy" or defer OAuth to Phase 17).

### Scope

Remote MCP sessions resolve scope identically to REST:

- `ownerId` from authenticated identity
- Optional `X-Workspace-Id` / `X-Agent-Id` headers on MCP HTTP upgrade (if host supports custom headers)
- Fallback: default workspace for owner (Phase 9 behavior)

### Security

- `REMOTE_MCP_ENABLED=false` by default — route not mounted
- Rate limits: reuse REST advisory limits per owner (Phase 3 plugin)
- CORS: explicit allowlist env `REMOTE_MCP_CORS_ORIGINS` (ChatGPT origin TBD — document at implementation)
- Warning parity with ChatGPT UI: custom MCP introduces risk — document in PANDUAN

---

## 6. ChatGPT setup matrix

| ChatGPT UI | Works today | After 13.1 |
|------------|-------------|------------|
| **New App → Server URL** | ❌ | ✅ `https://host/mcp` |
| **New App → Tunnel** | ❌ | ⚠️ Dev only (ngrok + local server) |
| **New App → OAuth** | ❌ | 🔲 Phase 17 |
| **Custom GPT → Actions** | ✅ REST + OpenAPI | ✅ unchanged fallback |
| **ChatGPT desktop MCP stdio** | N/A (OpenAI product) | N/A |

### Recommended user flows

**Production (after 13.1):**

1. Deploy API on host with **long-lived connections** (see §8)
2. Bootstrap / issue `aic_...` key
3. ChatGPT → New App → Server URL → `https://your-host/mcp`
4. Configure auth per ADR-048 (API key injection if UI supports custom headers; else documented workaround)

**Interim (now):**

1. Custom GPT → Actions → import OpenAPI from `/docs/json`
2. Auth: API Key `Bearer aic_...`
3. Instructions: search_memory / context / save handoff patterns

---

## 7. Event schema & tools

**Unchanged:** All 20 MCP tools from `MCP_TOOL_NAMES` — same schemas as stdio.

Optional additive server capability advertisement in MCP `initialize` result:

```json
{
  "serverInfo": {
    "name": "ai-memory-cloud",
    "version": "1.0.0"
  },
  "capabilities": {
    "tools": { "listChanged": false }
  },
  "instructions": "Use search_memory with project name. Save handoffs with save_memory."
}
```

Link to `GET /api/v1/capabilities` in server instructions (Phase 7.5).

---

## 8. Deployment constraints

| Host | REST Actions | Remote MCP SSE |
|------|--------------|----------------|
| **Vercel serverless** | ✅ | ⚠️ **Problematic** — short-lived, no persistent SSE |
| **Railway / Fly.io / VPS** | ✅ | ✅ Recommended |
| **Local + ngrok** | ✅ | ✅ Dev / ChatGPT Tunnel tab |

**Design decision:** Document Vercel limitation explicitly. Remote MCP target deployment = **long-running Node process** (`npm run dev` / Docker / Railway), not edge serverless.

Production URL in swagger today (`ai-brain-beryl.vercel.app`) remains valid for **REST Actions**; remote MCP may require separate `REMOTE_MCP_PUBLIC_URL` env for ChatGPT.

---

## 9. Gating

| Env | Default | Purpose |
|-----|---------|---------|
| `REMOTE_MCP_ENABLED` | `false` | Master switch |
| `REMOTE_MCP_PATH` | `/mcp` | HTTP mount path |
| `REMOTE_MCP_CORS_ORIGINS` | `*` (dev) / allowlist (prod) | Browser MCP clients |
| `REMOTE_MCP_PUBLIC_URL` | *(optional)* | Canonical URL for docs/manifest |

**Unchanged:** MCP stdio always available for IDE clients regardless of `REMOTE_MCP_ENABLED`.

---

## 10. Success criteria

- [ ] ChatGPT **Server URL** connects to staging `/mcp` with `aic_...` auth
- [ ] Tool parity: remote `search_memory` ≡ stdio `search_memory` (same handler)
- [ ] Default `REMOTE_MCP_ENABLED=false`; quality gate green
- [ ] PANDUAN updated: ChatGPT section with both paths (Remote MCP + Actions fallback)
- [ ] Vercel/serverless limitation documented
- [ ] No `MemoryService` / repository changes

---

## 11. Distinct from adjacent phases

| Phase | Relationship |
|-------|--------------|
| **10.5** | Extends MCP transport; stdio unchanged |
| **13** | Shares SSE/stream patterns; 13.1 can land as 13A track or parallel extension |
| **12** | Optional: `memory.accessed` audit from remote MCP sessions (via existing auditor) |
| **16** | npm `@ai-brain/mcp-server` may point at 13.1 URL or embed SDK |
| **17** | OAuth for ChatGPT dropdown |

---

## 12. Migration

**None.** Additive route + env flags only.

Rollback: `REMOTE_MCP_ENABLED=false` — route unmounted; stdio unaffected.

---

## References

- [MCP Specification — Transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [PANDUAN.md § ChatGPT](../../../docs/PANDUAN.md)
- [Phase 10.5 Transport](../10.5-transport-connectivity/DESIGN.md)
- [Phase 13 Protocol Layer](../13-protocol-layer/DESIGN.md)
- [Phase 16 Developer Platform](../16-developer-platform/DESIGN.md)
- [ADR-048 Remote MCP transport](../../adr/048-remote-mcp-transport.md)
