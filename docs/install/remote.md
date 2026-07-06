# Remote & Hosted — Ratary Memory MCP

Use when Ratary Server runs on **Vercel, Railway, VPS, Docker**, or any long-running host — not only local stdio.

**Server id:** `ratary`

---

## Path A — `@ratary/mcp-server` (npm proxy)

Best for IDE harnesses that support stdio MCP but connect to a **remote REST API**.

**npm:** [@ratary/mcp-server@1.1.0](https://www.npmjs.com/package/@ratary/mcp-server) · scope [`@ratary`](https://www.npmjs.com/org/ratary) (Ontorata)

### 1. Bootstrap API key

```bash
curl -X POST https://your-host.example.com/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"my-workstation"}'
```

Save `apiKey` (`aic_...`). Bootstrap works once when no identities exist.

### 2. MCP config

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://your-host.example.com",
        "RATARY_API_KEY": "aic_your_key_here",
        "RATARY_WORKSPACE_ID": ""
      }
    }
  }
}
```

Template: [docs/examples/mcp/remote-api.mcp.json.example](../examples/mcp/remote-api.mcp.json.example)

**Note:** npm proxy exposes a **subset** of tools vs full stdio — see [MCP/README.md](../../MCP/README.md).

---

## Path B — Remote MCP URL (`/mcp`)

For **ChatGPT New App**, web MCP clients, and harnesses that accept HTTPS MCP URLs.

### Deploy requirements

```bash
REMOTE_MCP_ENABLED=true
REMOTE_MCP_PATH=/mcp
REMOTE_MCP_PUBLIC_URL=https://your-host.example.com/mcp
REMOTE_MCP_CORS_ORIGINS=*
```

**Production on serverless:** set `REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED=true` only when you accept in-memory session limits — see [CONFIGURATION — Remote MCP](../CONFIGURATION.md).

Prefer **Railway, Fly.io, VPS, or Docker** for persistent SSE sessions.

### ChatGPT

1. **New App** → **Server URL** → `https://your-host.example.com/mcp`
2. Auth: API key `Authorization: Bearer aic_...` or OAuth when configured

Do **not** paste REST URLs (`/api/v1/...`) into the MCP Server URL field.

Details: [GUIDE — ChatGPT](../GUIDE.md#6-chatgpt).

---

## Path C — Custom GPT Actions (REST)

ChatGPT without MCP: import OpenAPI from `https://your-host/docs/json`, authenticate with `Bearer aic_...`.

See [GUIDE — ChatGPT](../GUIDE.md#6-chatgpt).

---

## Docker self-host

```bash
export AUTH_SECRET="$(openssl rand -hex 32)"
docker compose --profile postgres up --build
```

Then bootstrap locally: `http://localhost:9876/api/v1/auth/bootstrap`

Full runbook: [DOCKER.md](../DOCKER.md).

---

## Verify

```bash
curl https://your-host.example.com/health
curl -H "Authorization: Bearer aic_..." \
  https://your-host.example.com/api/v1/capabilities
```

In IDE with npm proxy: ask *"search memory about ratary"*.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 on API | Regenerate or use valid `aic_...` key |
| MCP disconnects on serverless | Move to persistent host or acknowledge env flag |
| CORS errors | Set `REMOTE_MCP_CORS_ORIGINS` to your client origin |

Full reference: [CONFIGURATION.md](../CONFIGURATION.md) · [MCP/README.md](../../MCP/README.md).
