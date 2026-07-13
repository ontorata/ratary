# mcp.so — submission

Submit at: **https://mcp.so/submit** or comment on [chatmcp/mcpso#1](https://github.com/chatmcp/mcpso/issues/1).

---

## Form / issue fields (copy-paste)

| Field | Value |
|-------|-------|
| **Server name** | Ratary Memory MCP |
| **Author** | Ontorata |
| **GitHub** | `https://github.com/ontorata/ratary` |
| **MCP docs** | `https://github.com/ontorata/ratary/tree/main/MCP` |
| **Install hub** | `https://github.com/ontorata/ratary/tree/main/docs/install` |
| **npm** | `@ratary/mcp-server@1.1.3` |
| **Registry** | `io.github.ontorata/ratary` |
| **License** | MIT |
| **Category / tags** | Memory, Development, AI coding assistant |
| **Contact** | hello@ontorata.com |

---

## Description

Ratary is an open-source AI Brain Platform. The Memory MCP server (`ratary`) gives coding assistants durable, owner-scoped memory across sessions — hybrid search, knowledge graph traversal, and token-efficient context assembly.

**Transports:** local stdio (28 tools, clone repo) · npm `@ratary/mcp-server` (REST proxy, 6 tools) · optional remote Streamable HTTP `/mcp` when deployed.

**Self-host:** D1, Postgres, Supabase, MariaDB, or Docker.

**Note:** Ontorata MCP and Ontorata Studio are separate products.

---

## Connection info

### npm proxy (hosted brain)

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://ratary.ontorata.com",
        "RATARY_API_KEY": "aic_..."
      }
    }
  }
}
```

### Full stdio (clone)

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary && npm install && cp .env.example .env
# Set SQL_PROVIDER + credentials
npm run db:migrate && npm run setup
```

---

## GitHub issue body template

```markdown
## Ratary Memory MCP

**Server name:** Ratary Memory MCP  
**Author:** Ontorata  
**GitHub:** https://github.com/ontorata/ratary  
**MCP docs:** https://github.com/ontorata/ratary/tree/main/MCP  
**Install:** https://github.com/ontorata/ratary/tree/main/docs/install  
**npm:** @ratary/mcp-server (1.1.1)  
**Official registry:** io.github.ontorata/ratary  
**License:** MIT  
**Category:** Memory / Development  

**Description:** Persistent coding memory for AI assistants — save, search, hybrid retrieval, knowledge graph, token-efficient context. MCP stdio (28 tools), npm proxy, or remote Streamable HTTP. Self-host on D1, Postgres, MariaDB, or Docker.

**Connection:** stdio via repo clone + `npm run setup`, or `npx -y @ratary/mcp-server` with `RATARY_API_KEY` + `RATARY_BASE_URL`.
```

Log issue URL in [directory-status.md](directory-status.md).
