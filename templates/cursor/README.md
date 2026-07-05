# Cursor starter template

Add to `.cursor/mcp.json` for **in-repo stdio** (recommended for IDE):

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

For **remote hosted** deployment (Phase 16 installable MCP via SDK):

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://ontorata.com",
        "RATARY_API_KEY": "aic_..."
      }
    }
  }
}
```

Run `npm run setup` in repo root for stdio env (`MCP_OWNER_ID`, etc.).
