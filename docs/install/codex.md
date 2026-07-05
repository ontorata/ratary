# Codex — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Codex App

1. Open **Plugins** in the sidebar
2. Search **Ratary**
3. Install when listed (marketplace submission optional)

Until listed, use manual MCP config from [cursor.md](cursor.md) (Codex supports similar JSON MCP blocks).

---

## Codex CLI

```text
/plugins
# Search "Ratary" → Install Plugin
```

---

## Fallback — local stdio

Clone Ratary, configure D1, run `npm run setup`. Point Codex MCP config at the generated stdio entry — see [examples/mcp/cursor.mcp.json.example](../examples/mcp/cursor.mcp.json.example).

Hosted: [remote.md](remote.md).

---

## Verify

Run a task that calls `search_memory` or ask the agent to load project context from Ratary.
