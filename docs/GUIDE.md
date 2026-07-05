# Ratary — Setup & Usage Guide

One guide for **setup, daily use, and Ratary MCP** (Cursor, Claude Code, Roo, Cline, Gemini CLI, and more).

**Related docs:** [CONFIGURATION.md](CONFIGURATION.md) (what each `.env` variable does) · [examples/](examples/) (MCP/IDE templates) · [policies/](policies/) (enterprise authorization, not env)

For per-harness plugin install (marketplace commands), see **[install/](install/)** when published (Phase 31). Quick path: `npm run setup` in this repo.

---

## 1. Setup

**Prerequisites:** Node.js 24 · [Cloudflare](https://dash.cloudflare.com) account (D1)

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
```

Fill `.env` from the [Cloudflare Dashboard](https://dash.cloudflare.com) — see **[CONFIGURATION.md § Tier 0](CONFIGURATION.md#tier-0--required-for-local-brain-d1--mcp-stdio)** for what each variable does.

- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `D1_API_TOKEN`
- `AUTH_SECRET` (min 32 characters — required for REST auth)

```bash
npm run db:migrate
npm run setup    # writes .cursor/mcp.json and .mcp.json
```

**Cursor:** Settings → MCP → server `ratary` green → Reload Window  
**Claude Code:** run `claude` in the repo folder → approve `ratary`

**Verify:** ask the assistant to *"search memory about ratary"*.

### First REST API key (optional)

For curl, ChatGPT Actions, or `@ratary/mcp-server`:

```bash
curl -X POST http://localhost:3000/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"local-dev"}'
```

Save the returned `apiKey` (`aic_...`). Bootstrap works once when no identities exist.

---

## 2. Daily usage (just chat)

You do not need to type tool names. Speak naturally:

| You want to… | Example |
|--------------|---------|
| Resume work | `Continue work on ratary — focus on documentation` |
| Load context first | `Read memory about auth before coding` |
| Save a handoff | `Save handoff: MCP fix done, continue tests tomorrow` |
| Search a topic | `Search memory about Vercel deployment` |
| Summarize decisions | `Summarize what we decided for project mangroveapps` |

**Tips:** mention **project name** (`ratary`, `mangroveapps`) and **topic** (`auth`, `hydration`). End sessions with a handoff.

### Smart memory (Phase 4)

The assistant selects relevant memory slices automatically — not a full dump. When MCP is green, **no extra setup**. Say *"continue work on …"*.

---

## 2.1 Agent Forge (contributors)

**Phase 07.1** defines the required workflow when AI changes code in this repo — **Cursor skills + rule**, not server runtime.

| Stage | Skill | When |
|-------|-------|------|
| Recall | `forge-recall` | Session start — MCP `search_memory` |
| Intent | `forge-intent` | Before non-trivial design/code |
| Isolate | `forge-isolate` | Isolated branch/worktree |
| Blueprint | `forge-blueprint` | Task plan before implementation |
| Execute | `forge-execute` | Implementation |
| Prove / Inspect | `forge-prove`, `forge-inspect` | Tests + review between tasks |
| Land | `forge-land` | Merge / PR / discard |
| Remember | `forge-remember` | Session end — MCP handoff |

Governance lives in the **development mirror** (`.ai/` — not in the public `ontorata/ratary` tree). Full test suite: [github.com/lutfi04/ai-brain](https://github.com/lutfi04/ai-brain).

Rule: `.cursor/rules/agent-forge.mdc` · Skills: `.cursor/skills/forge-*`

For multi-file or structural work, do not skip **Intent → Isolate → Blueprint**.

---

## 3. Security

| Scenario | `MCP_OWNER_ID` in `.env` |
|----------|--------------------------|
| Local solo dev | Optional |
| Production / team | **Required** (owner UUID from REST bootstrap) |

Without `MCP_OWNER_ID` in production, MCP **will not start** — prevents cross-user memory leaks.

**Phase 9 — workspace (optional):**

| Variable | Purpose |
|----------|---------|
| `MCP_WORKSPACE_ID` | Scope memory to a workspace (default: owner `default` workspace) |
| `MCP_AGENT_ID` | Agent attribution hint (`register_agent`) |

REST: `X-Workspace-Id` / `X-Agent-Id` headers on memory requests.

Never commit or share `.env`.

---

## 4. After `git pull`

1. `npm install`
2. `npm run setup`
3. Reload Cursor (or your MCP client)
4. Optional: `npm run db:migrate`

---

## 5. Troubleshooting

| Symptom | Fix |
|---------|-----|
| MCP red | `npm run setup` → reload IDE |
| Connection closed (Windows) | Use `command: "cmd"` — see §6 |
| AI ignores memory | Mention project + topic explicitly |
| Empty memory | Normal on fresh DB — save first |
| MCP error in production | Set `MCP_OWNER_ID`, or `NODE_ENV=development` for local stdio (loads `.env`). Reload MCP. |
| Claude pending approval | Run `claude` in repo → approve |
| ChatGPT | No local stdio — see §6.1 (Actions, Remote MCP, OAuth) |

---

## 6.1 ChatGPT

ChatGPT does **not** run local MCP stdio like Cursor. Two paths:

### A — Custom GPT + REST Actions (recommended today)

1. Deploy public API (e.g. Vercel) or tunnel to `npm run dev`
2. Bootstrap → save API key `aic_...` (see §1)
3. **Custom GPT** → Configure → **Actions** → Import OpenAPI from `https://<host>/docs/json`
4. Authentication: API Key → `Authorization: Bearer aic_...`
5. GPT instructions: search by project, `POST /context` for tasks, save handoffs via `POST /memory`

### B — Remote MCP: New App → Server URL (Phase 13.1)

ChatGPT **New App** form → **Server URL** → `https://<host>/mcp` (not REST `/api/v1`).

**Env (long-running host — Railway/VPS/Fly; SSE MCP is hard on Vercel serverless):**

```bash
REMOTE_MCP_ENABLED=true
REMOTE_MCP_PATH=/mcp
REMOTE_MCP_PUBLIC_URL=https://your-host.example.com/mcp
REMOTE_MCP_CORS_ORIGINS=*
```

**Auth:**

| Method | Extra env | Notes |
|--------|-----------|-------|
| API key | — | `Authorization: Bearer aic_...` or `X-API-Key` |
| OAuth (ChatGPT) | `REMOTE_MCP_OAUTH_ENABLED=true`, `OIDC_ISSUER_URL`, `OIDC_MCP_OWNER_ID` | Phase 17 OIDC; discovery at `/.well-known/oauth-protected-resource/mcp` |

Details: [MCP/README.md](../MCP/README.md) · Remote MCP smoke in repo tests.

Do **not** paste REST URLs (`/api/v1`) into the MCP Server URL field — different protocol.

---

## 6. MCP — other clients

**Recommended:** `npm run setup` (Cursor + Claude Code) — credentials from `.env`; do not duplicate secrets in `mcp.json`.

### Basic config

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/ratary/src/mcp/stdio.ts"],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "...",
        "D1_DATABASE_ID": "...",
        "D1_API_TOKEN": "...",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Use forward slashes in paths. Examples: [examples/mcp/](examples/mcp/).

### Windows — if `npx` fails

```json
"command": "cmd",
"args": ["/c", "npx", "-y", "tsx", "D:/Apps/ratary/src/mcp/stdio.ts"]
```

### Config file locations

| Client | File |
|--------|------|
| Cursor (project) | `.cursor/mcp.json` |
| Claude Code | `.mcp.json` |
| Roo Code | `.roo/mcp.json` |
| Gemini CLI | `.gemini/settings.json` — [examples/gemini-settings.json.example](examples/gemini-settings.json.example) |
| VS Code Copilot | `.vscode/mcp.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |

### Hosted API (`@ratary/mcp-server`)

```json
{
  "mcpServers": {
    "ratary": {
      "command": "npx",
      "args": ["-y", "@ratary/mcp-server"],
      "env": {
        "RATARY_BASE_URL": "https://your-host",
        "RATARY_API_KEY": "aic_..."
      }
    }
  }
}
```

npm proxy exposes **6 tools**; full stdio server in-repo exposes **28 tools**.

### Verify

```bash
npm run mcp              # should not crash — D1 OK
npm run test:integration
```

### MCP vs REST

| | MCP | REST API |
|---|-----|----------|
| Auth | D1 creds in env (stdio) or `aic_...` (remote/npm) | `Bearer aic_...` |
| Clients | Cursor, Claude, Cline, … | curl, ChatGPT Actions, SDK |
| Deploy | No server required (stdio) | Vercel / `npm run dev` |

Both write to the **same brain** when pointed at the same backend.

### Transport & gRPC (Phase 10.5)

REST, MCP, and gRPC share the **same application handlers** — no duplicated business logic.

| Protocol | Audience | Default |
|----------|----------|---------|
| REST `/api/v1` | Integrators, ChatGPT Actions | Always on |
| MCP stdio | IDE clients | Always on |
| MCP remote `/mcp` | ChatGPT, web MCP hosts | Opt-in — `REMOTE_MCP_ENABLED=true` |
| gRPC | Internal / enterprise streaming | Off — `GRPC_ENABLED=true` |

Check active transports: `GET /api/v1/capabilities` → `transport` section.

---

## 7. Optional commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | REST API + Swagger at `/docs` |
| `npm run sync:backups:watch` | Sync chat backup folder to D1 |
| `npm run db:backfill-embeddings` | Embeddings dry-run |
| `npm run db:backfill-embeddings:execute` | Run embedding backfill |

### Embeddings (Phase 5)

Backfill is **async** — CRUD never calls the embedding model on the hot path.

1. Default: `EMBEDDING_PROVIDER=noop`
2. OpenAI production: `EMBEDDING_PROVIDER=openai`, `EMBEDDING_API_KEY=sk-...`
3. Dry-run: `npm run db:backfill-embeddings`
4. Execute: `npm run db:backfill-embeddings:execute`

Deleting memory via REST/MCP cleans related vectors.

### Hybrid & graph retrieval (Phases 6 + 8)

| Variable | Default | Effect |
|----------|---------|--------|
| `HYBRID_RETRIEVAL` | `false` | SQL + vector (RRF) — needs embedding provider |
| `GRAPH_RETRIEVAL` | `false` | Graph leg in composite retrieval |
| `GRAPH_MAX_DEPTH` | `2` | BFS depth (max 3) |
| `GRAPH_SEED_CAP` | `5` | Lexical seeds per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Neighbor budget |

Graph exploration without flags: MCP `get_graph_capabilities`, `traverse_relations`; REST `GET /api/v1/graph/capabilities`, `POST /api/v1/graph/traverse`.

**Dense graph tuning:** lower `RETRIEVAL_RELATION_NEIGHBOR_CAP` (default 5 → 3) if context feels noisy.

### Protocol streaming (Phase 13)

```env
SSE_ENABLED=true
SSE_MAX_CONCURRENT_PER_IP=10
```

Endpoint: `GET /api/v1/context/stream?query=...` (Bearer auth). Long-running host required.

### Memory evolution (Phase 09.7)

```env
MEMORY_EVOLUTION_ENABLED=true
MEMORY_EVOLUTION_STORE_PROVIDER=sql
```

REST: `GET /api/v1/memory/:id/versions`, restore/merge endpoints.

### Semantic compression (Phase 05.5)

```env
COMPRESSION_ENABLED=true
COMPRESSION_SCHEDULER=local
```

CLI: `npm run compress:memories` (dry-run) · `compress:memories:execute`

---

## 8. Platform infrastructure (Phases 10 + 11)

External adapters are **opt-in via env**. Defaults unchanged (D1, inline storage).

| Variable | Default | Providers |
|----------|---------|-----------|
| `SQL_PROVIDER` | `d1` | `d1` · `postgres` |
| `VECTOR_PROVIDER` | `d1` | `d1` · `pgvector` |
| `OBJECT_STORAGE_PROVIDER` | `inline` | `inline` · `r2` · `s3` |
| `SEARCH_PROVIDER` | `sql` | `sql` · Meilisearch |
| `GRAPH_PROVIDER` | `d1` | `d1` · Neo4j |
| `CACHE_PROVIDER` | `none` | Redis |
| `EVENT_BUS_PROVIDER` | `none` | Redis Streams |
| `ANALYTICS_PROVIDER` | `none` | DuckDB |
| `ENTERPRISE_RBAC` | `false` | Workspace RBAC |
| `MEMORY_ACCESS_AUDIT` | `false` | Access trail |
| `OTEL_ENABLED` | `false` | OpenTelemetry |

Full reference: **[CONFIGURATION.md](CONFIGURATION.md)** · template: [.env.example](../.env.example)

### Postgres metadata (Phase 11)

| Env | Value |
|-----|-------|
| `SQL_PROVIDER` | `postgres` |
| `DATABASE_URL` | `postgresql://...` (from vault — never commit) |

```bash
npm run db:apply-postgres-schema
npm run db:backfill-d1-to-postgres          # dry-run
npm run db:backfill-d1-to-postgres -- --execute
npm run db:verify-postgres-parity
```

### External provider backfills

All backfill scripts are **dry-run by default**; add `--execute` to write.

| Command | Required env |
|---------|--------------|
| `npm run db:backfill-pgvector` | `PGVECTOR_DATABASE_URL` or `DATABASE_URL` |
| `npm run db:backfill-meilisearch` | `MEILISEARCH_HOST`, `MEILISEARCH_INDEX` |
| `npm run db:backfill-neo4j` | `NEO4J_URI`, credentials |

---

## 9. New development machine

Moving Ratary to a new workstation:

1. Clone repo (or copy workspace)
2. Copy `.env` securely (especially `AUTH_SECRET`, D1 credentials, `MCP_OWNER_ID` if set)
3. `npm install && npm run db:migrate`
4. `npm run setup` and reload MCP
5. Optional: `npm run test:integration`

---

## 10. Observability (Phases 12 / 19)

```env
OBSERVABILITY_PLATFORM=true
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

- Metrics: `GET /metrics` (Prometheus)
- Dashboards: `observability/dashboards/`
- Full stack: [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md)

Cost gauges (optional):

```env
CONTROL_PLANE_ENABLED=true
USAGE_METER_ENABLED=true
OBS_COST_METRICS_ENABLED=true
```

---

## 11. Agent ecosystem (Phase 15)

| Feature | MCP / REST |
|---------|------------|
| Register agents | `list_agents`, `register_agent` |
| Workspace scope | `x-workspace-id` header or MCP env |
| Federation | `FEDERATION_ENABLED=true` (opt-in) |

---

## Contributors & governance

| Need | Where |
|------|-------|
| This guide | `docs/GUIDE.md` — human operators & daily use |
| Architecture overview | [ARCHITECTURE.md](ARCHITECTURE.md) — human-readable summary |
| AI implementation law | `.ai/` — **development mirror only** ([lutfi04/ai-brain](https://github.com/lutfi04/ai-brain)) |
| ADRs, phases, Forge | Not shipped in public `ontorata/ratary`; clone the mirror for full governance |

Public repo = **Ratary Server** product code + human docs. Governance corpus stays in the mirror by design.

---

*Ratary · Ontorata · [hello@ontorata.com](mailto:hello@ontorata.com)*
