# Gemini CLI — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Setup

1. Clone Ratary and configure your **SQL provider** — [GUIDE — Setup](../GUIDE.md#1-setup)
2. Copy [docs/examples/gemini-settings.json.example](../examples/gemini-settings.json.example) to `.gemini/settings.json`
3. Replace `REPO_PATH` with your clone path

Example MCP block:

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "tsx", "REPO_PATH/src/mcp/stdio.ts"],
      "cwd": "REPO_PATH"
    }
  }
}
```

---

## Hosted

Use `@ratary/mcp-server` — [remote.md](remote.md).

---

## Verify

Run Gemini CLI in the repo directory and ask to search Ratary memory.
