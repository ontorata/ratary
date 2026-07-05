# Examples

**Purpose:** **Copy-paste templates** for connecting IDEs and clients to Ratary — not environment variables.

**Env reference:** [CONFIGURATION.md](../CONFIGURATION.md) · **Setup workflows:** [GUIDE.md](../GUIDE.md)

---

## What belongs here vs elsewhere

| Folder | Contains | You copy into… |
|--------|----------|----------------|
| **`docs/examples/`** (here) | MCP JSON, Gemini settings | `.cursor/mcp.json`, `.mcp.json`, `.gemini/settings.json` |
| **`.env.example`** (repo root) | Environment variable **names** | `.env` |
| **`docs/policies/`** | Rego **authorization** samples | OPA server bundle |
| **`observability/`** (repo root) | Grafana/SLO **assets** | Grafana import / API export |

---

## Quick start (recommended)

```bash
npm run setup
```

Generates `.cursor/mcp.json` and `.mcp.json` from your `.env` — no manual copy from examples unless you use a custom layout.

---

## Templates

| Example | Use when |
|---------|----------|
| [mcp/cursor.mcp.json.example](mcp/cursor.mcp.json.example) | Cursor — local stdio (direct D1) |
| [mcp/claude-code.mcp.json.example](mcp/claude-code.mcp.json.example) | Claude Code — local stdio |
| [mcp/remote-api.mcp.json.example](mcp/remote-api.mcp.json.example) | Any IDE — hosted API via `@ratary/mcp-server` |
| [gemini-settings.json.example](gemini-settings.json.example) | Gemini CLI MCP block |
| [cursor/README.md](cursor/README.md) | Cursor options (stdio vs npm package) |

Replace `REPO_PATH` with your clone path (e.g. `D:/Apps/ratary`). Use forward slashes on Windows.

---

## Required env for each pattern

| Pattern | Minimum `.env` | Docs |
|---------|----------------|------|
| Local stdio (examples above) | D1 credentials + `AUTH_SECRET` | [GUIDE.md § 1](../GUIDE.md#1-setup) |
| `@ratary/mcp-server` | `RATARY_BASE_URL` + `RATARY_API_KEY` on MCP env, not in repo `.env` | [CONFIGURATION.md § Client packages](../CONFIGURATION.md#client-packages-mcp--cli--sdk) |

---

## More

| Link | Description |
|------|-------------|
| [../SDK/](../SDK/) | Runnable `@ratary/sdk` scripts |
| [../policies/](../policies/) | OPA authorization samples (enterprise) |
| [../../MCP/README.md](../../MCP/README.md) | Ratary MCP tool list |
