# Examples

Starter configs and integration snippets for Ratary. Copy, adapt paths, and use in your project.

| Example | Description |
|---------|-------------|
| [mcp/cursor.mcp.json.example](mcp/cursor.mcp.json.example) | Cursor — local stdio (direct D1) |
| [mcp/claude-code.mcp.json.example](mcp/claude-code.mcp.json.example) | Claude Code — local stdio |
| [mcp/remote-api.mcp.json.example](mcp/remote-api.mcp.json.example) | Any IDE — hosted API via `@ratary/mcp-server` |
| [gemini-settings.json.example](gemini-settings.json.example) | Gemini CLI MCP settings |
| [cursor/README.md](cursor/README.md) | Cursor setup notes (stdio + npm package) |
| [../../SDK/](../../SDK/) | Runnable SDK scripts (`index.mjs`, `bot.mjs`) |
| [../policies/](../policies/) | OPA / Rego authorization examples |

**Quick setup:** run `npm run setup` in the repo root — generates `.cursor/mcp.json` and `.mcp.json` automatically.

Replace `REPO_PATH` in JSON examples with your clone path (e.g. `D:/Apps/ratary`).
