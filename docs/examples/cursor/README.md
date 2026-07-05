# Cursor

## Option A — auto setup (recommended)

```bash
npm run setup
```

Reload Cursor → **Settings → MCP** → server `ratary` should be green.

## Option B — local stdio (in-repo)

Copy [mcp/cursor.mcp.json.example](../mcp/cursor.mcp.json.example) to `.cursor/mcp.json` and replace `REPO_PATH`.

Or paste:

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/ratary"
    }
  }
}
```

## Option C — hosted API (`@ratary/mcp-server`)

Copy [mcp/remote-api.mcp.json.example](../mcp/remote-api.mcp.json.example) or:

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://ontorata.com",
        "RATARY_API_KEY": "aic_..."
      }
    }
  }
}
```

See also [MCP listing](../../MCP/README.md) and [GUIDE.md](../../GUIDE.md).
