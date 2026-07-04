# Cursor starter template

Add to `.cursor/mcp.json` for **in-repo stdio** (recommended for IDE):

```json
{
  "mcpServers": {
    "ai-memory-cloud": {
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
    "ai-memory-cloud-remote": {
      "command": "npx",
      "args": ["@ai-brain/mcp-server"],
      "env": {
        "AI_BRAIN_BASE_URL": "https://your-host.example.com",
        "AI_BRAIN_API_KEY": "aic_..."
      }
    }
  }
}
```

Run `npm run setup` in repo root for stdio env (`MCP_OWNER_ID`, etc.).
