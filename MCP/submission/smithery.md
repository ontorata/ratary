# Smithery — publish guide

Smithery: **https://smithery.ai/** · Publish: **https://smithery.ai/new** · Docs: [smithery.ai/docs/build/publish](https://smithery.ai/docs/build/publish)

Ratary supports **npm stdio** (`@ratary/mcp-server`) and optional **remote** `/mcp`. Smithery Gateway expects a **public HTTPS MCP URL** or an **`.mcpb` bundle**.

---

## Path A — Remote URL (recommended for Smithery)

When production has `REMOTE_MCP_ENABLED=true`:

| Field | Value |
|-------|-------|
| **URL** | `https://ratary.ontorata.com/mcp` |
| **Name** | `ontorata/ratary` |
| **Auth** | API key (`RATARY_API_KEY` / Bearer) |

### Web UI

1. Go to [smithery.ai/new](https://smithery.ai/new)
2. Enter MCP URL: `https://ratary.ontorata.com/mcp`
3. Add config schema for API key
4. Complete publish flow

### CLI

```bash
npm install -g smithery@latest
smithery auth login
smithery mcp publish "https://ratary.ontorata.com/mcp" -n ontorata/ratary \
  --config-schema '{"type":"object","properties":{"apiKey":{"type":"string","description":"Ratary API key (aic_...)"}},"required":["apiKey"]}'
```

**Note:** Remote `/mcp` returns 401 without credentials — expected. Smithery config schema supplies user API keys.

---

## Path B — npm package (metadata only)

Smithery does not host stdio npm packages directly. Users install via:

```bash
npx -y @ratary/mcp-server
```

Point listing description to [docs/install/remote.md](../../docs/install/remote.md) and Official Registry `io.github.ontorata/ratary`.

---

## Verify listing

```bash
smithery mcp search ratary
```

---

## Operator checklist

- [ ] `smithery auth login` (browser OAuth)
- [ ] Publish URL at smithery.ai/new or CLI
- [ ] Confirm `ontorata/ratary` appears in search
- [ ] Log URL in [directory-status.md](directory-status.md)
