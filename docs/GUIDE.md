# Ratary — Setup & Usage Guide

One guide for **setup, daily use, and Ratary MCP** (Cursor, Claude Code, Roo, Cline, Gemini CLI, and more).

**Related docs:** [README.md](README.md) (doc index) · [CONFIGURATION.md](CONFIGURATION.md) (env vars) · [ARCHITECTURE.md](ARCHITECTURE.md) · [examples/](examples/) · [policies/](policies/)

Quick path: `npm run setup` in this repo. Per-harness install: **[install/README.md](install/README.md)**.

---

## 1. Setup

**Prerequisites:** Node.js 24 · a **SQL metadata store** (see table below) · `AUTH_SECRET` for REST

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
```

### Choose your SQL stack

| Path | `SQL_PROVIDER` | What to configure | Guide |
|------|----------------|-------------------|-------|
| **Cloudflare D1** | `d1` | `CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID`, `D1_API_TOKEN` | [CONFIGURATION — D1](CONFIGURATION.md#cloudflare-d1-sql_providerd1) |
| **PostgreSQL** | `postgres` | `DATABASE_URL` | [DOCKER — postgres profile](DOCKER.md#quick-start-postgres-profile) or local Postgres |
| **Supabase** | `supabase` | `DATABASE_URL` (Supabase dashboard URI) | [CONFIGURATION — Supabase](CONFIGURATION.md#supabase-metadata-sql_providersupabase) |
| **MariaDB / MySQL** | `mariadb` / `mysql` | `MARIADB_CONNECTION_STRING` | [DOCKER — enterprise profile](DOCKER.md#profiles) |
| **Hosted API only** | (remote server) | `RATARY_API_KEY` | [install/remote.md](install/remote.md) — no local SQL |

Set `AUTH_SECRET` (min 32 characters) for REST auth on every self-hosted path.

**D1 example** — fill from [Cloudflare Dashboard](https://dash.cloudflare.com):

- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`
- `D1_API_TOKEN`

**Postgres / Supabase / MariaDB** — set `SQL_PROVIDER` and the matching connection string; use Docker compose, Supabase dashboard URI, or your own instance.

```bash
npm run db:migrate          # D1 schema via Cloudflare API
# Postgres: npm run db:apply-postgres-schema
npm run setup               # writes .cursor/mcp.json and .mcp.json
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

### npm client packages (`@ratary`)

Use these when you **do not** need to clone Ratary Server — e.g. custom agents, [Ontorata Studio](https://github.com/ontorata/Ontorata-Studio), or hosted MCP.

```bash
npm install @ratary/sdk@1.1.0
npx @ratary/mcp-server@1.1.0    # IDE → remote REST (see install/remote.md)
npm install -g @ratary/cli@1.1.0
```

| Variable | Purpose |
|----------|---------|
| `RATARY_BASE_URL` | Server URL (`http://localhost:3000` or production host) |
| `RATARY_API_KEY` | `aic_...` from bootstrap or `npm run key:create` |
| `RATARY_WORKSPACE_ID` | Optional workspace scope |

Packages live on npm under scope **`@ratary`** ([npm org](https://www.npmjs.com/org/ratary)), maintained by Ontorata. **Current:** `@ratary/sdk`, `@ratary/cli`, `@ratary/mcp-server` **v1.1.0**. Full reference: [packages/README.md](../packages/README.md).

### Ontorata Studio (web console)

**[Ontorata Studio](https://github.com/ontorata/Ontorata-Studio)** is the operator web UI for this Ratary server — browse memories, search, graph, and workspaces via `@ratary/sdk`. It lives in a **separate repository** (not bundled in the server Docker image).

```bash
git clone https://github.com/ontorata/Ontorata-Studio.git
cd Ontorata-Studio
npm install
cp .env.example .env
# VITE_RATARY_BASE_URL=http://localhost:3000
# VITE_RATARY_API_KEY=aic_...
npm run dev
```

Open `http://localhost:5173`. Memory MCP in your IDE remains server id **`ratary`**.

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

### Smart memory

The assistant selects relevant memory slices automatically — not a full dump. When MCP is green, **no extra setup**. Say *"continue work on …"*.

---

## 3. Security

| Scenario | `MCP_OWNER_ID` in `.env` |
|----------|--------------------------|
| Local solo dev | Optional |
| Production / team | **Required** (owner UUID from REST bootstrap) |

Without `MCP_OWNER_ID` in production, MCP **will not start** — prevents cross-user memory leaks.

**Workspace scoping (optional):**

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
| Connection closed (Windows) | Use `command: "cmd"` — see [section 6](#6-mcp--other-clients) |
| AI ignores memory | Mention project + topic explicitly |
| Empty memory | Normal on fresh DB — save first |
| MCP error in production | Set `MCP_OWNER_ID`, or `NODE_ENV=development` for local stdio (loads `.env`). Reload MCP. |
| Claude pending approval | Run `claude` in repo → approve |
| ChatGPT | No local stdio — see [ChatGPT setup](#61-chatgpt) (Actions, Remote MCP, OAuth) |

---

## 6.1 ChatGPT

ChatGPT does **not** run local MCP stdio like Cursor. Two paths:

### A — Custom GPT + REST Actions (recommended today)

1. Deploy public API (e.g. Vercel) or tunnel to `npm run dev`
2. Bootstrap → save API key `aic_...` (see [Setup](#1-setup))
3. **Custom GPT** → Configure → **Actions** → Import OpenAPI from `https://<host>/docs/json`
4. Authentication: API Key → `Authorization: Bearer aic_...`
5. GPT instructions: search by project, `POST /context` for tasks, save handoffs via `POST /memory`

### B — Remote MCP: New App → Server URL

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
| OAuth (ChatGPT) | `REMOTE_MCP_OAUTH_ENABLED=true`, `OIDC_ISSUER_URL`, `OIDC_MCP_OWNER_ID` | OIDC discovery at `/.well-known/oauth-protected-resource/mcp` |

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

### Transport & gRPC

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

Feature reference (what to prepare before optional flags): **[CONFIGURATION.md](CONFIGURATION.md)**.

| Command | Purpose |
|---------|---------|
| `npm run dev` | REST API + Swagger at `/docs` |
| `npm run sync:backups:watch` | Sync chat backup folder to D1 |
| `npm run db:backfill-embeddings` | Embeddings dry-run |
| `npm run db:backfill-embeddings:execute` | Run embedding backfill |

### Embeddings

Backfill is **async** — CRUD never calls the embedding model on the hot path.

1. Default: `EMBEDDING_PROVIDER=noop` — see [CONFIGURATION → Embeddings](CONFIGURATION.md#embeddings)
2. OpenAI: set `EMBEDDING_PROVIDER=openai`, `EMBEDDING_API_KEY=sk-...`
3. Dry-run: `npm run db:backfill-embeddings`
4. Execute: `npm run db:backfill-embeddings:execute`

Deleting memory via REST/MCP cleans related vectors.

### Hybrid & graph retrieval

See [CONFIGURATION → Hybrid retrieval](CONFIGURATION.md#hybrid-retrieval) and [Graph retrieval](CONFIGURATION.md#graph-retrieval).

Graph exploration without retrieval flags: MCP `get_graph_capabilities`, `traverse_relations`; REST `GET /api/v1/graph/capabilities`, `POST /api/v1/graph/traverse`.

**Dense graph tuning:** lower `RETRIEVAL_RELATION_NEIGHBOR_CAP` (default 5 → 3) if context feels noisy.

### Protocol streaming

See [CONFIGURATION → SSE context streaming](CONFIGURATION.md#sse-context-streaming).

```env
SSE_ENABLED=true
SSE_MAX_CONCURRENT_PER_IP=10
```

Endpoint: `GET /api/v1/context/stream?query=...` (Bearer auth). Long-running host required.

### Memory evolution

See [CONFIGURATION → Memory evolution](CONFIGURATION.md#memory-evolution-version-control).

```env
MEMORY_EVOLUTION_ENABLED=true
MEMORY_EVOLUTION_STORE_PROVIDER=sql
```

REST: `GET /api/v1/memory/:id/versions`, restore/merge endpoints.

### Semantic compression

See [CONFIGURATION → Semantic compression](CONFIGURATION.md#semantic-compression).

```env
COMPRESSION_ENABLED=true
COMPRESSION_SCHEDULER=local
```

CLI: `npm run compress:memories` (dry-run) · `compress:memories:execute`

---

## 8. Platform infrastructure

External adapters are **opt-in via env**. Set **`SQL_PROVIDER`** to your metadata database first; other adapters are independent.

Adapter reference: **[CONFIGURATION.md Tier 2](CONFIGURATION.md#tier-2--platform-adapters)** · template: [.env.example](../.env.example)

### Postgres metadata

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

### MariaDB / MySQL metadata

| Env | Value |
|-----|-------|
| `SQL_PROVIDER` | `mariadb` or `mysql` |
| `MARIADB_CONNECTION_STRING` | `mysql://user:pass@host:3306/ratary` |

Use the same metadata schema as Postgres. For a full on-prem stack with object storage, see [DOCKER.md — enterprise profile](DOCKER.md#profiles).

### Enterprise Docker stack (MariaDB + MinIO)

```bash
# Set AUTH_SECRET in .env first
docker compose --profile enterprise up --build -d
```

Pre-wired env: `SQL_PROVIDER=mariadb`, `OBJECT_STORAGE_PROVIDER=minio`, `CACHE_PROVIDER=redis`. Details: [DOCKER.md](DOCKER.md).

### Additional enterprise adapters

See [CONFIGURATION.md Tier 2](CONFIGURATION.md#tier-2--platform-adapters) for:

| Provider | Env flag | Use case |
|----------|----------|----------|
| MinIO | `OBJECT_STORAGE_PROVIDER=minio` | S3-compatible on-prem blobs |
| OpenSearch | `SEARCH_PROVIDER=opensearch` | Cluster lexical search |
| ClickHouse | `ANALYTICS_PROVIDER=clickhouse` | Production analytics warehouse |
| Azure Blob / GCS | `OBJECT_STORAGE_PROVIDER=azure\|gcs` | Cloud procurement requirements |
| TiDB / CockroachDB | `SQL_PROVIDER=tidb\|cockroachdb` | Distributed SQL (Postgres wire) |

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
2. Copy `.env` securely (especially `AUTH_SECRET`, SQL connection vars, `MCP_OWNER_ID` if set)
3. `npm install && npm run db:migrate`
4. `npm run setup` and reload MCP
5. Optional: `npm run test:integration`

---

## 10. Observability

See [CONFIGURATION → Observability platform](CONFIGURATION.md#observability-platform).

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

## 11. Knowledge fabric (live connectors)

**Opt-in.** Ingest pages and records from external systems into Ratary memory with provenance. Phase 29 ships **Notion live sync**; other connectors remain catalog/MVP until flagged on.

### Enable on the server

Add to `.env` (see [CONFIGURATION — Knowledge fabric](CONFIGURATION.md#knowledge-fabric-connectors)):

```env
KNOWLEDGE_FABRIC_ENABLED=true
CONNECTOR_SYNC_ENABLED=true
NOTION_API_TOKEN=ntn_...          # Notion integration — keep secret
NOTION_API_VERSION=2022-06-28
# CONNECTOR_WEBHOOK_SECRET=...    # optional — for inbound webhooks
# CONNECTOR_SYNC_INTERVAL_MS=0    # 0 = REST/CLI only
```

Restart Ratary (`npm run dev` from repo root). Verify capabilities:

```bash
curl -s "$RATARY_BASE_URL/health" | jq '.capabilities.supportsKnowledgeFabric'
# true when fabric flags are on
```

Create a [Notion integration](https://www.notion.so/my-integrations), copy the token, and **share** the pages/databases the integration should read.

### Sync via SDK or CLI

Requires `@ratary/sdk@1.1.0+` and API key (`aic_...`):

```typescript
import { RataryClient } from '@ratary/sdk';

const client = new RataryClient({
  baseUrl: process.env.RATARY_BASE_URL!,
  apiKey: process.env.RATARY_API_KEY!,
});

const status = await client.admin.knowledgeFabric.getStatus();
const { connectors } = await client.admin.knowledgeFabric.listConnectors();

await client.admin.knowledgeFabric.ingest('notion', {
  mode: 'incremental',
  dryRun: true,   // preview without writes
  limit: 10,
});
```

CLI (same env vars):

```bash
ratary admin knowledge-fabric status
ratary connectors sync notion --mode incremental --dry-run
ratary connectors sync notion --mode incremental
```

### Smoke test (monorepo)

From repository root with `.env` configured:

```bash
npx tsx scripts/test-notion-sync.ts --url http://localhost:9876 --dry-run
npx tsx scripts/test-notion-sync.ts --url http://localhost:9876 --live
```

Memories appear under project `knowledge-fabric` with tags like `fabric:notion`. Search via MCP or `client.memory.search({ query: '...' })`.

### Production checklist

1. Merge latest server to your production branch and redeploy.
2. Set the same fabric env vars on the host (e.g. Vercel Production).
3. Confirm `/health` reports `supportsKnowledgeFabric: true`.
4. Run sync with `--dry-run` first, then live ingest.

Hosted Ratary (`https://ratary.ontorata.com`) enables fabric only after deploy + env — not on legacy `main` until promoted from `staging`.

---

## 12. Agent ecosystem

See [CONFIGURATION → Federation](CONFIGURATION.md#federation) and workspace vars in [Tier 0 → MCP memory scope](CONFIGURATION.md#mcp-memory-scope).

| Feature | MCP / REST |
|---------|------------|
| Register agents | `list_agents`, `register_agent` |
| Workspace scope | `x-workspace-id` header or MCP env |
| Federation | `FEDERATION_ENABLED=true` (opt-in) |

---

## More documentation

| Need | Document |
|------|----------|
| Documentation index | [README.md](README.md) |
| Architecture overview | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Environment reference | [CONFIGURATION.md](CONFIGURATION.md) |
| Contributing | [../README.md#contributing](../README.md#contributing) |

---

*Ratary · Ontorata · [hello@ontorata.com](mailto:hello@ontorata.com)*
