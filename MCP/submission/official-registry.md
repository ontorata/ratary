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

1. **npm:** Add `"mcpName": "io.github.ontorata/ratary"` to `packages/mcp-server/package.json`, bump version, `npm publish` from `packages/mcp-server` (registry verifies `mcpName` on the tarball).
2. Install **mcp-publisher** per [official quickstart](https://modelcontextprotocol.io/registry/quickstart) (Windows: download `mcp-publisher_windows_amd64.tar.gz` from registry releases).
3. Authenticate: `mcp-publisher login github` (GitHub account with access to `ontorata/ratary`).
4. Bump `version` in [official-registry.server.json](official-registry.server.json) to match npm.
5. From repo root:

```powershell
mcp-publisher validate MCP/submission/official-registry.server.json
mcp-publisher publish MCP/submission/official-registry.server.json
```

4. Confirm listing appears at registry UI and syncs to GitHub MCP catalog (may take 24–48h).
5. Record status in [directory-status.md](directory-status.md).

---

## Remote endpoint (optional second listing)

When a production `/mcp` URL is stable (e.g. `https://ratary.ontorata.com/mcp`):

```json
"remotes": [
  {
    "type": "streamable-http",
    "url": "https://YOUR_HOST/mcp"
  }
]
```

Requires `REMOTE_MCP_ENABLED=true` on deploy. See [docs/install/remote.md](../../docs/install/remote.md).
