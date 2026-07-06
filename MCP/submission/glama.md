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

## Glama remote URL error (`auth_required`)

If Glama shows:

```json
{"error":"auth_required","message":"Server requires authentication but did not advertise OAuth..."}
```

**Cause:** Glama probed `/mcp` without API key, followed OAuth PRM, and found no `authorization_servers` (Ratary is **API-key only**, not OAuth).

**Fix (pick one):**

| Submit as | Config |
|-----------|--------|
| **GitHub server (recommended)** | Repo `ontorata/ratary` — Glama builds **stdio** via `npx @ratary/mcp-server` + env `RATARY_API_KEY` |
| **HTTPS connector** | URL `https://ratary.ontorata.com/mcp` + **private test credentials** → API key `aic_...` (Bearer) |

Do **not** expect OAuth on production today (`REMOTE_MCP_OAUTH_ENABLED=false`). ChatGPT OAuth needs a DCR-capable IdP (not Supabase).

## Operator checklist

- [x] Merge `glama.json` to `main` (PR #24)
- [x] Submit at https://glama.ai/mcp/servers (`ontorata/ratary`) — operator 2026-07-06
- [ ] Wait for indexing — verify https://glama.ai/mcp/servers/ontorata/ratary
- [ ] **Claim ownership** on Glama
- [ ] Confirm **quality score** badge on server page
- [x] awesome-mcp PR #9454 — README fixed (Ratary badge `ontorata/ratary`)

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
