# Smithery — publish guide (long-term)

Smithery: **https://smithery.ai/** · Publish: **https://smithery.ai/new** · Docs: [smithery.ai/docs/build/publish](https://smithery.ai/docs/build/publish)

## Long-term architecture

Ratary supports **two independent remote MCP distribution paths**:

| Path | Audience | Auth | Ratary surface |
|------|----------|------|----------------|
| **URL + API key** | Smithery, gateways, self-serve HTTP clients | `Authorization: Bearer aic_...` or `X-API-Key` | `REMOTE_MCP_ENABLED=true`, `REMOTE_MCP_OAUTH_ENABLED=false` |
| **OAuth (ChatGPT, etc.)** | MCP clients with OIDC | OAuth via DCR-capable IdP | `REMOTE_MCP_OAUTH_ENABLED=true` + `OIDC_ISSUER_URL` (not Supabase — no DCR) |
| **stdio / npm** | Cursor, Claude, local IDE | API key in env | `@ratary/mcp-server` or clone + `npm run setup` |
| **MCPB bundle** (optional) | Smithery Local publish | Packaged stdio | Future: `.mcpb` from `packages/mcp-server` |

**Do not enable Supabase OIDC for Smithery URL publish** — Smithery probes OAuth metadata; Supabase lacks dynamic client registration.

### Static server card (Smithery URL — required)

Serve manual metadata so Smithery skips OAuth discovery scan:

```
GET https://ratary.ontorata.com/.well-known/mcp/server-card.json
```

Implemented in `src/transport/mcp/remote/mcp-server-card.ts` when `REMOTE_MCP_ENABLED=true`.

After deploy, Smithery publish flow:

1. MCP URL: `https://ratary.ontorata.com/mcp`
2. Parameter: **`apiKey`** (Smithery forwards as Bearer to upstream)
3. Scan uses **server-card.json**, not OAuth metadata

### Production env (Smithery-compatible)

```bash
REMOTE_MCP_ENABLED=true
REMOTE_MCP_OAUTH_ENABLED=false
REMOTE_MCP_PATH=/mcp
REMOTE_MCP_PUBLIC_URL=https://ratary.ontorata.com/mcp
REMOTE_MCP_CORS_ORIGINS=*
REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED=true   # Vercel/serverless only
```

Redeploy after changes.

---

## Path A — Remote URL (Smithery Gateway)

| Field | Value |
|-------|-------|
| **URL** | `https://ratary.ontorata.com/mcp` |
| **Server ID** | `ratary` |
| **Config parameter** | `apiKey` — Ratary API key (`aic_...`) |

### CLI (alternative)

```bash
npm install -g smithery@latest
smithery auth login
smithery mcp publish "https://ratary.ontorata.com/mcp" -n ontorata/ratary \
  --config-schema '{"type":"object","properties":{"apiKey":{"type":"string","description":"Ratary API key (aic_...)"}},"required":["apiKey"]}'
```

**Note:** Never put API keys in the MCP URL query string. Rotate any key exposed in URLs. Smithery may pass `apiKey` as query — Ratary promotes it to `Authorization: Bearer` automatically.

If publish still fails OAuth discovery, confirm production returns **200** on:
- `/.well-known/mcp/server-card.json`
- `/.well-known/oauth-protected-resource/mcp` (bearer-only, empty `authorization_servers`)

---

## Path B — MCPB bundle (future / optional)

For stdio-only distribution without hosting `/mcp`:

```bash
smithery mcp publish ./packages/mcp-server/dist/server.mcpb -n ontorata/ratary
```

Requires building an MCPB artifact per [Smithery Local docs](https://smithery.ai/docs/build/publish).

---

## Path C — OAuth (ChatGPT only, separate from Smithery)

When ChatGPT OAuth is needed:

1. Use an IdP with **dynamic client registration** (not Supabase Auth)
2. Set `REMOTE_MCP_OAUTH_ENABLED=true` + `OIDC_ISSUER_URL` + `OIDC_MCP_OWNER_ID`
3. Smithery URL listing should stay on **API key + server-card** (OAuth off) or use MCPB path

---

## Verify listing

```bash
smithery mcp search ratary
curl https://ratary.ontorata.com/.well-known/mcp/server-card.json
```

---

## Operator checklist

- [x] Production env: OAuth off, remote MCP on, server-card returns 200
- [x] Rich server-card (28 tools, annotations, prompts, resources, instructions)
- [x] `smithery.yaml` at repo root
- [ ] Re-scan / re-publish on Smithery after deploy (target 90–100)
- [ ] Upload icon + fill homepage in Smithery UI
- [ ] Log final URL in [directory-status.md](directory-status.md)

## Score optimization (47 → 90+)

1. Deploy enriched server-card + `smithery.yaml` to `main`
2. Smithery dashboard → **Re-scan** or new release
3. Upload **icon**, verify **Performance** shows 28 tools with full schemas
