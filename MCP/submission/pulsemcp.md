# PulseMCP — listing path

PulseMCP is **not** published via a separate CLI in the [Official MCP Registry quickstart](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/quickstart.mdx). That guide covers **registry.modelcontextprotocol.io** only.

PulseMCP ([pulsemcp.com](https://www.pulsemcp.com)) ingests servers from:

1. **Official MCP Registry** (primary — automated)
2. Manual submissions via [pulsemcp.com/submit](https://www.pulsemcp.com/submit)
3. Crawling / curation

**Recommended path for Ratary:** publish to the Official Registry first, then wait for PulseMCP sync (or email to expedite).

---

## Step 1 — Official MCP Registry (done)

Per quickstart:

| Prerequisite | Ratary status |
|--------------|---------------|
| npm `mcpName` in package | `@ratary/mcp-server@1.1.1` → `io.github.ontorata/ratary` |
| npm publish | [npmjs.com/package/@ratary/mcp-server](https://www.npmjs.com/package/@ratary/mcp-server) |
| `server.json` | [official-registry.server.json](official-registry.server.json) |
| `mcp-publisher login github` | Operator (ontorata) |
| `mcp-publisher publish` | Published 2026-07-06 |

**Verify** (from quickstart):

```powershell
(Invoke-WebRequest "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.ontorata/ratary").Content
```

Expected: `"name":"io.github.ontorata/ratary"`, `"status":"active"`.

Do **not** use `GET /v0/servers/{name}` — use the **search** endpoint above.

---

## Step 2 — PulseMCP (auto-sync)

After Official Registry listing is **active**, PulseMCP typically picks up the server within ~1 week (registry crawl cadence).

| Action | When |
|--------|------|
| Wait for auto-sync | Default — no form needed |
| Expedite | Email **hello@pulsemcp.com** with server name `io.github.ontorata/ratary` + registry URL |
| Manual form | [pulsemcp.com/submit](https://www.pulsemcp.com/submit) — only if not listed after ~7 days |

---

## Manual form (copy-paste, if needed)

Reuse [mcpservers-org.md](mcpservers-org.md) fields:

| Field | Value |
|-------|-------|
| **Server name** | Ratary |
| **Description** | Persistent coding memory for AI assistants — save, search, hybrid retrieval, knowledge graph, and token-efficient context. MCP stdio (28 tools), npm proxy, or remote Streamable HTTP. Self-host on D1, Postgres, MariaDB, or Docker. |
| **GitHub / docs link** | `https://github.com/ontorata/ratary/tree/main/MCP` |
| **Registry name** | `io.github.ontorata/ratary` |
| **npm** | `@ratary/mcp-server` |
| **Category** | Memory |
| **Contact** | hello@ontorata.com |

---

## Troubleshooting (from official quickstart)

| Error | Fix |
|-------|-----|
| Registry validation failed for package | Ensure npm tarball has `mcpName` matching `server.json` `name` |
| Invalid or expired Registry JWT | `mcp-publisher logout` then `mcp-publisher login github` |
| Permission denied on publish | GitHub auth user must match `io.github.ontorata/...` namespace |

---

## After listed on PulseMCP

Update [directory-status.md](directory-status.md) with listing URL (e.g. `https://www.pulsemcp.com/servers/...`).
