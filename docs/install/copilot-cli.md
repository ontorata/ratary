# GitHub Copilot CLI — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Marketplace (when listed)

```bash
copilot plugin marketplace add ontorata/ratary-marketplace
copilot plugin install ratary@ratary-marketplace
```

---

## Fallback

Use `@ratary/mcp-server` with REST credentials — see [remote.md](remote.md).

For local stdio, configure Copilot CLI MCP per vendor docs using:

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

Replace `REPO_PATH` with your Ratary clone.

---

## Verify

```bash
copilot plugin list
```

Ask Copilot to search Ratary memory for your project name.
