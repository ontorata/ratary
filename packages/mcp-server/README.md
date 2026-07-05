# @ratary/mcp-server

Stdio MCP server that proxies a **hosted** Ratary REST API via `@ratary/sdk`. Exposes a subset of tools compared to full in-repo stdio ([MCP/README.md](../../MCP/README.md)).

```bash
npx @ratary/mcp-server
# or: npm install -g @ratary/mcp-server && ratary-mcp
```

**npm:** [npmjs.com/package/@ratary/mcp-server](https://www.npmjs.com/package/@ratary/mcp-server)

---

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `RATARY_BASE_URL` | yes | Ratary Server base URL |
| `RATARY_API_KEY` | yes | API key (`aic_...`) |
| `RATARY_WORKSPACE_ID` | no | Workspace scope |

## Cursor / IDE config

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://your-host.example.com",
        "RATARY_API_KEY": "aic_your_key_here"
      }
    }
  }
}
```

Install guide: [docs/install/remote.md](../../docs/install/remote.md).

---

## License

MIT · [ontorata/ratary](https://github.com/ontorata/ratary)
