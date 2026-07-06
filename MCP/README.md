# Ratary — MCP Server

**Category:** Memory · **Transport:** stdio (local) + Streamable HTTP (remote, opt-in)  
**Repository:** [github.com/ontorata/ratary](https://github.com/ontorata/ratary)  
**Listing:** submit to [mcpservers.org](https://mcpservers.org/submit) with link `https://github.com/ontorata/ratary/tree/main/MCP`

Persistent **coding memory** for AI assistants — save, search, build token-efficient context, knowledge graph traversal, and multi-client sync. Works with **Cursor**, **Claude Code**, **Roo**, **Cline**, **Gemini CLI**, and remote MCP hosts (ChatGPT App URL when deployed).

**Ecosystem:** Built by [Ontorata](https://ontorata.com). This doc covers **Ratary Memory MCP** (id **`ratary`**). **[Ontorata MCP](https://github.com/ontorata/ontorata-mcp)** and **[Ontorata Studio](https://github.com/ontorata/Ontorata-Studio)** are separate repos.

**npm:** Hosted REST proxy — [`@ratary/mcp-server`](https://www.npmjs.com/package/@ratary/mcp-server) ([`@ratary` org](https://www.npmjs.com/org/ratary)). Full stdio (28 tools) requires cloning this repo.

---

## Where is the server code?

| Mode | Location | When to use |
|------|----------|-------------|
| **Full server (28 tools)** | [`src/mcp/stdio.ts`](../src/mcp/stdio.ts) → [`src/transport/mcp/mcp-server.ts`](../src/transport/mcp/mcp-server.ts) | Clone repo; any `SQL_PROVIDER` (D1, Postgres, Supabase, MariaDB, …) |
| **npm proxy (6 tools)** | [`packages/mcp-server/`](../packages/mcp-server/) (`@ratary/mcp-server`) | Connect to hosted REST API with `RATARY_API_KEY` |
| **Remote HTTPS** | [`src/transport/mcp/remote/`](../src/transport/mcp/remote/) | `REMOTE_MCP_ENABLED=true` on Vercel deploy |

Tool registry SSOT: [`src/capabilities/mcp-tool-names.ts`](../src/capabilities/mcp-tool-names.ts)

---

## Quick start (local stdio)

Configure **one SQL metadata provider** first — see [CONFIGURATION — SQL metadata store](../docs/CONFIGURATION.md#sql-metadata-store-choose-one).

### 1. Prerequisites

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
# Set SQL_PROVIDER + matching credentials (D1, DATABASE_URL, or MARIADB_CONNECTION_STRING)
npm run db:migrate   # D1 only — use db:apply-postgres-schema for Postgres / Supabase
```

**REST dev server:** `npm run dev` → `http://localhost:9876` (Swagger `/docs`). Override with `PORT` in `.env`.

### 2. Generate MCP config

```bash
npm run setup
```

Writes `.cursor/mcp.json` and `.mcp.json` automatically.

### 3. Manual config (any IDE)

See [docs/examples/mcp/cursor.mcp.json.example](../docs/examples/mcp/cursor.mcp.json.example) — replace `REPO_PATH` with your clone path.

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
export RATARY_BASE_URL=https://ratary.ontorata.com
export RATARY_API_KEY=aic_...
ratary-mcp
```

Config example: [docs/examples/mcp/remote-api.mcp.json.example](../docs/examples/mcp/remote-api.mcp.json.example)

---

## Remote MCP URL (ChatGPT / web clients)

Deploy with:

```env
REMOTE_MCP_ENABLED=true
```

Endpoint: `https://your-host/mcp` (Bearer `aic_...` or OAuth when enabled).  
CI smoke: `tests/transport/remote-mcp-chatgpt-smoke.test.ts` (ChatGPT-style initialize payload).  
Details: [GUIDE — ChatGPT](../docs/GUIDE.md#6-chatgpt) · [CONFIGURATION — Tier 4](../docs/CONFIGURATION.md#tier-4--transport--protocols)

---

## Tools (full server — 28)

| Tool | Purpose |
|------|---------|
| `save_memory`, `update_memory`, `delete_memory` | CRUD |
| `get_memory`, `get_memory_by_codename`, `get_memory_by_path`, `search_memory` | Read & search (precision modes when `PRECISION_SEARCH_ENABLED=true`) |
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

## Directory listings (Phase 31L)

Submit **Ratary Memory MCP** to public directories using the copy-paste pack in **[MCP/submission/](submission/README.md)**.

| Pack file | Directory |
|-----------|-----------|
| [submission/mcpservers-org.md](submission/mcpservers-org.md) | [mcpservers.org/submit](https://mcpservers.org/submit) — **Memory** category |
| [submission/official-registry.server.json](submission/official-registry.server.json) | [Official MCP Registry](https://registry.modelcontextprotocol.io/) |
| [submission/awesome-mcp-servers-entry.md](submission/awesome-mcp-servers-entry.md) | awesome-mcp-servers GitHub PRs |
| [submission/cursor-marketplace.md](submission/cursor-marketplace.md) | Cursor plugin marketplace |
| [submission/claude-marketplace.md](submission/claude-marketplace.md) | Claude Code plugin marketplace |
| [submission/directory-status.md](submission/directory-status.md) | Operator tracking (Ready → Submitted → Listed) |

### mcpservers.org (quick copy)

| Field | Value |
|-------|-------|
| **Server name** | Ratary |
| **Short description** | Persistent coding memory for AI assistants — save, search, hybrid retrieval, knowledge graph, token-efficient context. MCP stdio (28 tools), npm proxy, or remote Streamable HTTP. Self-host on D1, Postgres, Supabase, MariaDB, or Docker. |
| **Link** | `https://github.com/ontorata/ratary/tree/main/MCP` |
| **Category** | Memory |
| **Contact** | hello@ontorata.com |

### Harness marketplace manifests

| Path | Purpose |
|------|---------|
| [harness/marketplace/ratary-marketplace.json](../harness/marketplace/ratary-marketplace.json) | Claude Code `/plugin marketplace add` source |
| [harness/claude-code/plugin.json](../harness/claude-code/plugin.json) | Plugin metadata stub |
| [harness/marketplace/README.md](../harness/marketplace/README.md) | Publish instructions |

### Metadata SSOT

Repo-local metadata for tooling: [server.json](server.json) (stdio + npm + remote flags). Registry publish uses [submission/official-registry.server.json](submission/official-registry.server.json).

**Boundary:** List **Ratary Memory MCP** (`ratary`) only — not [Ontorata MCP](https://github.com/ontorata/ontorata-mcp) or [Ontorata Studio](https://github.com/ontorata/Ontorata-Studio).

---

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/install/README.md](../docs/install/README.md) | Per-harness installation (Cursor, Claude, remote, …) |
| [MCP/submission/README.md](submission/README.md) | Directory listing submission pack (31L) |
| [docs/GUIDE.md](../docs/GUIDE.md) | Setup & usage |
| [docs/DOCKER.md](../docs/DOCKER.md) | Container self-host |
| [docs/README.md](../docs/README.md) | Human docs index |
| [docs/examples/](../docs/examples/) | MCP configs, IDE templates, SDK patterns |

## License

MIT — see [LICENSE](../LICENSE) in repository root.
