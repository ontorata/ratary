# Ratary — MCP Server

**Category:** Memory · **Transport:** stdio (local) + Streamable HTTP (remote, opt-in)  
**Repository:** [github.com/ontorata/ratary](https://github.com/ontorata/ratary)  
**Listing:** submit to [mcpservers.org](https://mcpservers.org/submit) with link `https://github.com/ontorata/ratary/tree/main/MCP`

Persistent **coding memory** for AI assistants — save, search, build token-efficient context, knowledge graph traversal, and multi-client sync. Works with **Cursor**, **Claude Code**, **Roo**, **Cline**, **Gemini CLI**, and remote MCP hosts (ChatGPT App URL when deployed).

---

## Where is the server code?

| Mode | Location | When to use |
|------|----------|-------------|
| **Full server (27 tools)** | [`src/mcp/stdio.ts`](../src/mcp/stdio.ts) → [`src/transport/mcp/mcp-server.ts`](../src/transport/mcp/mcp-server.ts) | Clone repo; direct Cloudflare D1 / Postgres |
| **npm proxy (6 tools)** | [`packages/mcp-server/`](../packages/mcp-server/) (`@ratary/mcp-server`) | Connect to hosted REST API with `RATARY_API_KEY` |
| **Remote HTTPS** | [`src/transport/mcp/remote/`](../src/transport/mcp/remote/) | `REMOTE_MCP_ENABLED=true` on Vercel deploy |

Tool registry SSOT: [`src/capabilities/mcp-tool-names.ts`](../src/capabilities/mcp-tool-names.ts)

---

## Quick start (local stdio — recommended)

### 1. Prerequisites

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
# Fill CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID, D1_API_TOKEN
npm run db:migrate
```

### 2. Generate MCP config

```bash
npm run setup
```

Writes `.cursor/mcp.json` and `.mcp.json` automatically.

### 3. Manual config (any IDE)

See [examples/cursor.mcp.json.example](examples/cursor.mcp.json.example) — replace `REPO_PATH` with your clone path.

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "tsx", "REPO_PATH/src/mcp/stdio.ts"],
      "cwd": "REPO_PATH"
    }
  }
}
```

Reload MCP in your IDE. No API key needed in Cursor when using direct D1 mode.

---

## Remote / hosted API (npm package)

For teams using a deployed Ratary REST endpoint:

```bash
npm install -g @ratary/mcp-server
export RATARY_BASE_URL=https://ontorata.com
export RATARY_API_KEY=aic_...
ratary-mcp
```

Config example: [examples/remote-api.mcp.json.example](examples/remote-api.mcp.json.example)

---

## Remote MCP URL (ChatGPT / web clients)

Deploy with:

```env
REMOTE_MCP_ENABLED=true
```

Endpoint: `https://your-host/mcp` (Bearer `aic_...` or OAuth when enabled).  
Details: [Phase 13.1](../.ai/phases/13.1-remote-mcp-clients/README.md) · [ADR-048](../.ai/adr/048-remote-mcp-transport.md)

---

## Tools (full server — 27)

| Tool | Purpose |
|------|---------|
| `save_memory`, `update_memory`, `delete_memory` | CRUD |
| `get_memory`, `get_memory_by_codename`, `search_memory` | Read & search |
| `get_context`, `build_prompt` | Token-efficient context (~85% savings default) |
| `list_projects`, `list_tags` | Navigation |
| `link_memories`, `list_relations`, `traverse_relations`, `get_graph_capabilities` | Knowledge graph |
| `list_workspaces`, `list_agents`, `register_agent` | Multi-AI workspace |
| `get_capabilities`, `negotiate_capabilities` | Agent discovery |
| `submit_signal` | Quality feedback (ranking adaptation) |
| `run_stewardship`, `get_compression_status` | Maintenance |
| `sync_pull`, `sync_push`, `sync_status` | Multi-client sync (opt-in) |
| `toggle_favorite`, `archive_memory` | Lifecycle |

---

## mcpservers.org submission

| Field | Value |
|-------|-------|
| **Server name** | Ratary |
| **Short description** | Persistent coding memory for AI assistants — MCP stdio + remote URL, hybrid search, knowledge graph, token-efficient context. Self-host on Cloudflare D1 or Postgres. |
| **Link** | `https://github.com/ontorata/ratary/tree/main/MCP` |
| **Category** | Memory |
| **Contact** | hello@ontorata.com |

---

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/PANDUAN.md](../docs/PANDUAN.md) | Setup & usage (Indonesian) |
| [docs/README.md](../docs/README.md) | Human docs index |
| [.ai/adr/048-remote-mcp-transport.md](../.ai/adr/048-remote-mcp-transport.md) | Remote MCP ADR |

## License

MIT — see [LICENSE](../LICENSE) in repository root.
