# Ratary — Setup & Usage Guide

One guide for **setup, daily use, and Ratary MCP** (Cursor, Claude Code, Roo, Cline, Gemini CLI, and more).

**Related docs:** [README.md](README.md) (doc index) · [CONFIGURATION.md](CONFIGURATION.md) (env vars) · [ARCHITECTURE.md](ARCHITECTURE.md) · [examples/](examples/) · [policies/](policies/)

Quick path: `npm run setup` in this repo. Per-harness install: **[install/README.md](install/README.md)**.

**Local defaults:** Ratary REST `http://localhost:9876` (`PORT`) · Ontorata Studio `http://localhost:8765` — see [CONFIGURATION — Local development ports](CONFIGURATION.md#local-development-ports).

---

## 1. Setup

**Prerequisites:** Node.js 24 · a **SQL metadata store** (see table below) · `AUTH_SECRET` for REST

> **First install stops at `.env.example` sections 1–2** — set auth + SQL only, then `npm run setup`. Section 3+ is optional.

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
```

### Quick start (matches `.env.example` header)

1. `cp .env.example .env`
2. Set `AUTH_SECRET` (`openssl rand -hex 32`) and `DATABASE_URL` (or D1 credentials)
3. **Postgres:** `npm run db:apply-postgres-schema` · **D1:** `npm run db:migrate`
4. `npm run setup` — wires Ratary MCP for your IDE

Skip sections 2+ in `.env.example` on first install.

### Choose your SQL stack

| Path | `SQL_PROVIDER` | What to configure | `.env.example` | Details |
|------|----------------|-------------------|----------------|---------|
| **PostgreSQL** | `postgres` | `DATABASE_URL` | Tier 1 — PostgreSQL | [DOCKER postgres](DOCKER.md#quick-start-postgres-profile) · [CONFIGURATION](CONFIGURATION.md#postgres-metadata-sql_providerpostgres) |
| **Cloudflare D1** | `d1` | `CLOUDFLARE_*`, `D1_*` | Tier 1 — D1 | [CONFIGURATION — D1](CONFIGURATION.md#cloudflare-d1-sql_providerd1) |
| **Supabase** | `supabase` | `DATABASE_URL` | Tier 1 — Supabase | [CONFIGURATION — Supabase](CONFIGURATION.md#supabase-metadata-sql_providersupabase) |
| **MariaDB / MySQL** | `mariadb` / `mysql` | `MARIADB_CONNECTION_STRING` | Tier 1 — MariaDB / MySQL | [DOCKER enterprise](DOCKER.md#profiles) |
| **TiDB / CockroachDB** | `tidb` / `cockroachdb` | `DATABASE_URL` | Tier 1 — TiDB / CockroachDB | [CONFIGURATION Tier 2](CONFIGURATION.md#tier-2--platform-adapters) |
| **Hosted API only** | (remote) | `RATARY_API_KEY` | Section 8 (client, not server) | [install/remote.md](install/remote.md) |

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
curl -X POST http://localhost:9876/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"local-dev"}'
```

Save the returned `apiKey` (`aic_...`). Bootstrap works once when no identities exist.

### npm client packages (`@ratary`)

Use these when you **do not** need to clone Ratary Server — e.g. custom agents, [Ontorata Studio](https://github.com/ontorata/Ontorata-Studio), or hosted MCP.

> **Server `.env` vs client env:** Ratary Server uses `AUTH_SECRET`, `SQL_PROVIDER`, `DATABASE_URL`, etc. (Tiers 0–1 in [`.env.example`](../.env.example)). Client tools use `RATARY_BASE_URL` and `RATARY_API_KEY` on your **workstation** (section 8 of `.env.example` — not copied into server deploy).

```bash
npm install @ratary/sdk@1.1.0
npx @ratary/mcp-server@1.1.3    # IDE → remote REST (see install/remote.md)
npm install -g @ratary/cli@1.1.0
```

| Variable | Purpose |
|----------|---------|
| `RATARY_BASE_URL` | Server URL (`http://localhost:9876` or production host) |
| `RATARY_API_KEY` | `aic_...` from bootstrap or `npm run key:create` |
| `RATARY_WORKSPACE_ID` | Optional workspace scope |

Packages live on npm under scope **`@ratary`** ([npm org](https://www.npmjs.com/org/ratary)), maintained by Ontorata. **Current:** `@ratary/sdk` · `@ratary/cli` **v1.1.0** · `@ratary/mcp-server` **v1.1.3**. Full reference: [packages/README.md](../packages/README.md).

### Ontorata Studio (web console)

**[Ontorata Studio](https://github.com/ontorata/Ontorata-Studio)** is the operator web UI for this Ratary server — browse memories, search, graph, and workspaces via `@ratary/sdk`. It lives in a **separate repository** (not bundled in the server Docker image).

```bash
git clone https://github.com/ontorata/Ontorata-Studio.git
cd Ontorata-Studio
npm install
cp .env.example .env
# VITE_RATARY_BASE_URL=http://localhost:9876
# Sign in at /login with aic_... API key (no VITE_RATARY_API_KEY in production)
npm run dev
```

Open `http://localhost:8765`. Memory MCP in your IDE remains server id **`ratary`**.

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
| Connection closed (Windows) | Use `command: "cmd"` — see [section 7](#7-mcp--other-clients) |
| AI ignores memory | Mention project + topic explicitly |
| Empty memory | Normal on fresh DB — save first |
| MCP error in production | Set `MCP_OWNER_ID`, or `NODE_ENV=development` for local stdio (loads `.env`). Reload MCP. |
| `AUTH_SECRET` / 401 on REST | Generate secret (`openssl rand -hex 32`); bootstrap once for `aic_...` key |
| `DATABASE_URL` / SQL errors | Match `SQL_PROVIDER`; Postgres: `npm run db:apply-postgres-schema` |
| Rate limit / flaky on Vercel | Set `RATE_LIMIT_REDIS_URL` (Upstash Redis) for multi-instance |
| `supportsKnowledgeFabric: false` | Set fabric env + redeploy — [PRODUCTION-ENABLE.md](PRODUCTION-ENABLE.md) |
| Bootstrap already used | Create key via `POST /auth/identities` or `npm run key:create` |
| Claude pending approval | Run `claude` in repo → approve |
| ChatGPT | No local stdio — see [ChatGPT setup](#6-chatgpt) (Actions, Remote MCP, OAuth) |

### MCP tool errors — `{error, retryable}` contract

A failing MCP tool never crashes the transport. The tool result carries `isError: true` with parseable JSON text: `{"error": "<message>", "retryable": <bool>}`.

- `retryable: true` → idempotent read failed transiently; retry with short bounded backoff (2–3 attempts).
- `retryable: false` → mutation, `run_stewardship`, or a deterministic failure (validation / not-found / auth). Do **not** blind-retry — for writes, pass a `request_id` (below) or continue the turn and reconcile on the next recall.

### Idempotent creates — `request_id` (ADR-067)

`save_memory` accepts an optional `request_id` (UUID). Retrying a create with the same `request_id` replays the original result as a success (`duplicate: true, replayed: true`) instead of creating a duplicate — even if the first attempt failed ambiguously mid-write. `sync_push` create items are protected the same way, keyed by the item's `memory_id`.

**Idempotency is guaranteed while the intent record exists.** Records are pruned after `WRITE_INTENT_TTL_DAYS` (default 30 days, cleanup policy only). Without a `request_id`, behavior is unchanged.
- Treat memory as best-effort context: a missed write is recoverable, a crashed agent turn is not.

Full contract + per-tool classification: [MCP/README.md — Error contract](../MCP/README.md#error-contract-error-retryable).

---

## 6. ChatGPT

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
| OAuth (ChatGPT) | `REMOTE_MCP_OAUTH_ENABLED=true`, `OIDC_ISSUER_URL`, `OIDC_MCP_OWNER_ID` | DCR-capable IdP required — [MCP-CHATGPT-OAUTH.md](MCP-CHATGPT-OAUTH.md) |

Details: [MCP/README.md](../MCP/README.md) · Remote MCP smoke in repo tests.

Do **not** paste REST URLs (`/api/v1`) into the MCP Server URL field — different protocol.

---

## 7. MCP — other clients

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

## 8. Optional commands

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

### Canonical entity resolution

Deterministic symbol grounding (ADR-068): codenames, tags, and keywords resolve
to owner-scoped canonical entities via exact normalized/alias matching — no
fuzzy matching, no embeddings, no LLM. Runs as an async stewardship stage,
never on the write hot path.

```env
ENTITY_RESOLUTION_ENABLED=true
ENTITY_STORE_PROVIDER=sql
```

CLI: `npm run resolve:entities` (dry-run) · `resolve:entities:execute`

With the flag on, retrieval gains an `entity` candidate source (memories
mentioning entities resolved from the query). Guarantees:

- **Flag-off byte-parity** — with `ENTITY_RESOLUTION_ENABLED=false`, retrieval
  output is byte-identical whether or not entity data exists.
- **Immutable entity ids** — renames/alias corrections never re-key mentions.
- **Versioned evidence** — every resolution records `resolverVersion`, the
  matching `rule`, and the matched symbol, so results stay replayable.

### Decision provenance

Auditable why/effect chains over decision memories (ADR-069). Extends relation
types with `motivated_by`, `caused_by`, `resulted_in`, and `supersedes`. Query
via `IProvenanceQuery` (`whyChain` / `effectChain`) when the flag is on.

```env
DECISION_PROVENANCE_ENABLED=true
```

Guarantees:

- **Flag-off byte-parity** — with `DECISION_PROVENANCE_ENABLED=false`, retrieval
  is unchanged whether or not provenance-typed relations exist.
- **Append-only history** — `supersedes` never deletes prior edges or memories.
- **Versioned evidence** — every provenance edge carries `provenanceVersion` +
  `rule` (`supersedes` also requires `conflictKind`).
- **No auto-causation** — stewardship stage `provenance-candidates` may suggest
  `caused_by` from existing `depends_on` edges as findings only.

---

## 9. Platform infrastructure

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

## 10. New development machine

Moving Ratary to a new workstation:

1. Clone repo (or copy workspace)
2. Copy `.env` securely (especially `AUTH_SECRET`, SQL connection vars, `MCP_OWNER_ID` if set)
3. **D1:** `npm run db:migrate` · **Postgres:** `npm run db:apply-postgres-schema`
4. `npm run setup` and reload MCP
5. Optional: `npm run test:integration`

---

## 11. Observability

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

## 12. Knowledge fabric (live connectors)

**Opt-in.** Ingest from external systems into Ratary memory with provenance.

**Live connectors (Phase 29+):** Notion, Confluence, Google Drive, SharePoint, Teams.  
**Universal fabric (Phase 32):** `UNIVERSAL_MEMORY_FABRIC_ENABLED` unifies fabric + federation provenance.

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

**Confluence Cloud (optional):** set `CONFLUENCE_BASE_URL`, `CONFLUENCE_EMAIL`, and `CONFLUENCE_API_TOKEN` (Atlassian API token with Confluence read scope).

```bash
ratary connectors sync confluence --mode incremental --dry-run
```

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
npx tsx scripts/test-connector-sync.ts --connector notion --url http://localhost:9876 --dry-run
npx tsx scripts/test-connector-sync.ts --connector notion --url http://localhost:9876 --live
# Also: confluence | drive | sharepoint | teams
```

Memories appear under project `knowledge-fabric` with tags like `fabric:notion`. Search via MCP or `client.memory.search({ query: '...' })`.

### Production checklist

1. Merge latest server to your production branch and redeploy.
2. Set the same fabric env vars on the host (e.g. Vercel Production).
3. Confirm `/health` reports `supportsKnowledgeFabric: true`.
4. Run sync with `--dry-run` first, then live ingest.

Hosted Ratary (`https://ratary.ontorata.com`): `supportsKnowledgeFabric: true` with Notion configured (2026-07-06). See [PRODUCTION-ENABLE.md](PRODUCTION-ENABLE.md).

---

## 13. Agent ecosystem

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
