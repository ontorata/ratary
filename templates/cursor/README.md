# Cursor starter template

Add to `.cursor/mcp.json` for **in-repo stdio** (recommended for IDE):

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/ai-brain"
    }
  }
}
```

For **remote hosted** deployment (Phase 16 installable MCP via SDK):

```json
{
  "mcpServers": {
    "ratary-remote": {
      "command": "npx",
      "args": ["@ratary/mcp-server"],
      "env": {
        "AI_BRAIN_BASE_URL": "https://your-host.example.com",
        "AI_BRAIN_API_KEY": "aic_..."
      }
    }
  }
}
```

Run `npm run setup` in repo root for stdio env (`MCP_OWNER_ID`, etc.).
