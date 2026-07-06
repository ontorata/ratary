# Glama.ai — listing & awesome-mcp PR

Glama indexes MCP servers from GitHub, scores tools (TDQS), and **requires a Glama badge** on punkpeye/awesome-mcp-servers PRs.

## Repo setup (done / merge to main)

`glama.json` at repo root:

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["lutfi04"]
}
```

Org repo `ontorata/ratary` — claim via `glama.json` (GitHub sign-in alone is not enough).

## Operator checklist

1. Merge `glama.json` to `main`
2. https://glama.ai/mcp/servers → **Add MCP Server**
   - Repo: `https://github.com/ontorata/ratary`
   - Display name: **Ratary Memory MCP**
3. Wait for indexing (~minutes) — verify https://glama.ai/mcp/servers/ontorata/ratary
4. **Claim ownership** on Glama (re-run after `glama.json` lands)
5. Confirm **quality score** badge loads on server page
6. awesome-mcp PR #9454 — push fixed README (Ratary badge = `ontorata/ratary`, not mindmap)

## awesome-mcp-servers line (with Glama badge)

```markdown
- [Ratary](https://github.com/ontorata/ratary/tree/main/MCP) [![Ratary MCP server](https://glama.ai/mcp/servers/ontorata/ratary/badges/score.svg)](https://glama.ai/mcp/servers/ontorata/ratary) 📇 🏠 ☁️ 🍎 🪟 🐧 - Persistent coding memory for AI assistants — hybrid search, knowledge graph, token-efficient context. MCP stdio (28 tools), npm `@ratary/mcp-server`, optional remote Streamable HTTP. Self-host D1, Postgres, MariaDB, or Docker.
```

## PR #9454 bot feedback (2026-07-06)

| Bot | Issue | Fix |
|-----|-------|-----|
| glama-badge-check | Badge pointed at `ravi-labs/mindmap-mcp-server` | Use `ontorata/ratary` badge after Glama indexes |
| duplicate-check | mindmap entry duplicated / stripped | Restore mindmap line; add Ratary as separate line |

Discord: https://glama.ai/discord
