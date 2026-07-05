# Claude Code — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Prerequisites

- Ratary clone with D1 configured **or** hosted server + API key
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed

---

## Option A — Auto setup (recommended)

From your Ratary clone:

```bash
npm run setup
```

Creates project `.mcp.json` for Claude Code.

Run `claude` in the repo folder → approve MCP server **`ratary`** when prompted.

---

## Option B — Plugin marketplace (when listed)

```text
/plugin marketplace add ontorata/ratary-marketplace
/plugin install ratary@ratary-marketplace
```

Marketplace manifest ships in [`harness/marketplace/`](../../harness/marketplace/). Publish to `ontorata/ratary-marketplace` when ready. Until then, use Option A.

---

## Option C — Manual project MCP

Project `.mcp.json`:

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

Replace `REPO_PATH`. Prefer Option A so secrets stay in `.env`, not in JSON.

---

## Option D — Hosted (`@ratary/mcp-server`)

See [remote.md](remote.md) — same npm proxy config as Cursor Option D.

---

## Verify

In Claude Code: *"Search memory about ratary"*. Approve tool calls on first use if prompted.

---

## Update / reinstall

```bash
git pull && npm install && npm run setup
```

Marketplace: `/plugin update ratary@ratary-marketplace`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pending approval | Run `claude` inside repo; accept MCP |
| No tools | Confirm `.mcp.json` exists; check D1 env |

Full guide: [GUIDE.md](../GUIDE.md).
