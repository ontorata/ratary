# ADR-048: Remote MCP Transport (ChatGPT & Web Clients)

**Status:** Implemented

---

## Context

Ratary ships MCP **stdio** for IDE clients (Cursor, Claude Code). ChatGPT and other cloud products require a **public HTTPS MCP endpoint** (Streamable HTTP / SSE) via "Server URL" — not local process spawn.

[PANDUAN.md](../../docs/PANDUAN.md) currently directs ChatGPT users to REST Actions only.

## Problem

Without a server-hosted remote MCP transport:

1. ChatGPT **New App** MCP form cannot connect to ai-brain
2. Integrators may expose ad-hoc REST wrappers pretending to be MCP
3. Tool parity risk if a separate MCP server is forked outside `createMcpServer()`

## Constraints

- Same 20 MCP tools and handlers as stdio (Phase 10.5)
- `MemoryService` and repositories unchanged
- Default OFF — `REMOTE_MCP_ENABLED=false`
- Auth reuse: Phase 3 `aic_...` API keys
- Vercel serverless not assumed for SSE long-lived sessions

## Alternatives

### Option A — In-repo remote MCP route on Fastify

- Pros: Single deployment; shared handlers; ChatGPT URL points directly at hub
- Cons: Requires long-running host for SSE; OAuth deferred

### Option B — Phase 16 npm proxy only

- Pros: Separates client package from server
- Cons: Extra hop; ChatGPT still needs a URL — proxy must be hosted somewhere
- Verdict: **Complement** Option A, not replacement

### Option C — REST Actions only (status quo)

- Pros: Works today on Vercel
- Cons: Not MCP; ChatGPT New App form unused; no tool discovery parity

## Decision

**Adopt Option A — in-repo `McpRemoteTransportServer`:**

1. Mount MCP Streamable HTTP / SSE at `REMOTE_MCP_PATH` (default `/mcp`)
2. Gate with `REMOTE_MCP_ENABLED=false`
3. Authenticate with Bearer / `X-API-Key` `aic_...`
4. Delegate to existing `createMcpServer()` instance
5. Keep REST Custom GPT Actions documented as fallback
6. Phase 16 `@ratary/mcp-server` MAY consume this endpoint via SDK

## Tradeoffs

- **Gain:** ChatGPT and web MCP hosts can use same memory hub as Cursor
- **Accept:** OAuth not in MVP; long-running deploy required for SSE

## Migration

1. Deploy with flag OFF
2. Enable on staging long-running host
3. Rollback: `REMOTE_MCP_ENABLED=false`

## References

- [Phase 13.1 DESIGN](../phases/13.1-remote-mcp-clients/DESIGN.md)
- [ADR-027 Transport connectivity layer](027-transport-connectivity-layer.md)
- [ADR-031 Developer platform](031-developer-platform.md)
- [MCP Transports spec](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
