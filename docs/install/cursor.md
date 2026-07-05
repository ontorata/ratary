# Cursor — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Prerequisites

- [Ratary Server](../../README.md#quick-start) running locally (`npm run dev`) **or** a hosted URL with API key
- Node.js 24 (for stdio path)

---

## Option A — Auto setup (recommended)

From your Ratary clone:

```bash
npm install
cp .env.example .env
# Fill D1 credentials — see CONFIGURATION Tier 0
npm run db:migrate
npm run setup
```

Writes `.cursor/mcp.json` using credentials from `.env`.

**Cursor:** Settings → MCP → confirm server **`ratary`** is green → Reload Window.

---

## Option B — Manual `mcp.json`

Copy [docs/examples/mcp/cursor.mcp.json.example](../examples/mcp/cursor.mcp.json.example) to `.cursor/mcp.json`. Replace `REPO_PATH` with your clone path.

---

## Option C — Marketplace (when listed)

In Cursor chat:

```text
/add-plugin ratary
```

Or search **Ratary** in Cursor plugin marketplace. Marketplace listing is optional — Options A/B always work.

---

## Option D — Hosted brain (`@ratary/mcp-server`)

When Ratary Server runs remotely:

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://your-host.example.com",
        "RATARY_API_KEY": "aic_your_key"
      }
    }
  }
}
```

See [remote.md](remote.md) for bootstrap and env details.

---

## Verify

Ask Cursor: *"Search memory about ratary"*. MCP tools should include `search_memory`, `save_memory`, `get_context`.

---

## Update / reinstall

```bash
git pull && npm install && npm run setup
```

For marketplace installs, use Cursor's plugin update flow.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MCP red / not loading | Reload Window; check Node 24; verify `.env` D1 creds |
| Production MCP blocked | Set `MCP_OWNER_ID` or use `NODE_ENV=development` locally |

Full guide: [GUIDE.md](../GUIDE.md).
