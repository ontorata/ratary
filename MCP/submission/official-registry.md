# Official MCP Registry

Registry: **https://registry.modelcontextprotocol.io/**

---

## Metadata file

Use [official-registry.server.json](official-registry.server.json) — validated against schema `2025-12-11`.

| Field | Notes |
|-------|-------|
| `name` | `io.github.ontorata/ratary` — must match GitHub org/repo casing |
| `description` | ≤100 characters (strict) |
| `packages` | npm `@ratary/mcp-server` stdio transport |
| `remotes` | Omit here; add a second entry or version bump when publishing a stable public `/mcp` URL |

---

## Publish steps (operator)

1. Install MCP registry CLI per [official docs](https://modelcontextprotocol.io/).
2. Authenticate with GitHub account that owns `ontorata/ratary`.
3. From repo root:

```bash
# Example — verify CLI flags against current registry docs before running
mcp publish MCP/submission/official-registry.server.json
```

4. Confirm listing appears at registry UI and syncs to GitHub MCP catalog (may take 24–48h).
5. Record status in [directory-status.md](directory-status.md).

---

## Remote endpoint (optional second listing)

When a production `/mcp` URL is stable (e.g. `https://ontorata.com/mcp`):

```json
"remotes": [
  {
    "type": "streamable-http",
    "url": "https://YOUR_HOST/mcp"
  }
]
```

Requires `REMOTE_MCP_ENABLED=true` on deploy. See [docs/install/remote.md](../../docs/install/remote.md).
