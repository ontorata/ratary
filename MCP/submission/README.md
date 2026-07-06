# MCP directory submission pack (Phase 31L)

Copy-paste materials for listing **Ratary Memory MCP** (`ratary`) on public MCP directories and harness marketplaces.

**Server id:** always `ratary` · **Not** Ontorata MCP (`ontorata/ontorata-mcp` is a separate listing).

---

## Before you submit

1. Confirm `origin/main` is public and README install links work.
2. Choose listing tier: **stdio clone**, **npm `@ratary/mcp-server`**, or **remote `/mcp`** — use the matching blurb below.
3. Record submission date and ticket/PR in [directory-status.md](directory-status.md).

---

## Pack index

| File | Use for |
|------|---------|
| [mcpservers-org.md](mcpservers-org.md) | [mcpservers.org/submit](https://mcpservers.org/submit) form |
| [official-registry.server.json](official-registry.server.json) | [Official MCP Registry](https://registry.modelcontextprotocol.io/) (`mcp publish` / API) |
| [awesome-mcp-servers-entry.md](awesome-mcp-servers-entry.md) | PR to awesome-mcp-servers lists |
| [cursor-marketplace.md](cursor-marketplace.md) | Cursor plugin / directory listing |
| [claude-marketplace.md](claude-marketplace.md) | Claude Code plugin marketplace |
| [pulsemcp.md](pulsemcp.md) | PulseMCP — auto-sync from Official Registry (+ optional manual form) |
| [directory-status.md](directory-status.md) | Operator tracking table |

---

## Recommended submission order

1. **mcpservers.org** — free, high visibility (Memory category)
2. **Official MCP Registry** — enables GitHub MCP Registry sync
3. **awesome-mcp-servers** (punkpeye or appcypher) — GitHub PR
4. **PulseMCP** — auto-sync after Official Registry ([pulsemcp.md](pulsemcp.md)); **mcp.so** optional manual form
5. **Cursor / Claude marketplaces** — when vendor forms open; manifests in [`harness/marketplace/`](../../harness/marketplace/)

---

## One-line pitch (all directories)

> Ratary Memory MCP — persistent coding memory with hybrid search, knowledge graph, and token-efficient context for Cursor, Claude Code, and remote MCP hosts. Self-host on D1, Postgres, MariaDB, or connect via `@ratary/mcp-server`.

---

## Links (canonical)

| Resource | URL |
|----------|-----|
| MCP overview | `https://github.com/ontorata/ratary/tree/main/MCP` |
| Install hub | `https://github.com/ontorata/ratary/tree/main/docs/install` |
| Tool list | `https://github.com/ontorata/ratary/tree/main/MCP#tools-full-server--28` |
| npm proxy | `https://www.npmjs.com/package/@ratary/mcp-server` |
| Contact | hello@ontorata.com |

---

## PulseMCP note

PulseMCP does **not** use `mcp-publisher` directly. Publish to the [Official MCP Registry](https://registry.modelcontextprotocol.io/) first ([quickstart](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/quickstart.mdx)), then PulseMCP auto-ingests. Details: [pulsemcp.md](pulsemcp.md).

---

*Submission pack — Phase 31L. Update directory-status.md after each submit.*
