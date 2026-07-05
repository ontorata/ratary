# Configuration Reference

**Purpose:** Explain **what each environment variable does** and **when to set it**.  
**Template file:** [.env.example](../.env.example) (copy → `.env` — never commit `.env`)  
**How-to workflows:** [GUIDE.md](GUIDE.md) (setup, MCP, troubleshooting)

---

## How to use this document

| You want to… | Read |
|--------------|------|
| First install (D1 + MCP) | [GUIDE.md § 1](GUIDE.md#1-setup) — only **Tier 0** vars below |
| Turn on Postgres / Redis / enterprise flags | **Tier 2+** sections here + [GUIDE.md § 8](GUIDE.md#8-platform-infrastructure-phases-10--11) |
| Copy MCP or IDE config | [examples/](examples/) — not env vars |
| Write authorization rules (Rego) | [policies/](policies/) — separate from env |
| Grafana / Prometheus | [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) |

**Convention in `.env.example`:**

- Uncomment and set a variable to **opt in** to that feature.
- Commented lines show **defaults** — Ratary runs without them on a fresh D1 install.
- `true`/`false` flags use string values in `.env` (e.g. `HYBRID_RETRIEVAL=true`).

---

## Tier 0 — Required for local brain (D1 + MCP stdio)

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes (D1) | Cloudflare account for D1 HTTP API |
| `D1_DATABASE_ID` | Yes (D1) | Target D1 database UUID |
| `D1_API_TOKEN` | Yes (D1) | API token with D1 read/write |
| `AUTH_SECRET` | Yes (REST) | HMAC secret for API keys — `openssl rand -hex 32` |
| `NODE_ENV` | Recommended | `development` local · `production` deployed |
| `PORT` | Optional | REST port (default `3000`) |
| `LOG_LEVEL` | Optional | `info` typical |

**MCP scope (optional but important in production):**

| Variable | Purpose |
|----------|---------|
| `MCP_OWNER_ID` | Isolate memory to one owner UUID (from bootstrap). **Required in production** or MCP stdio refuses to start. |
| `MCP_WORKSPACE_ID` | Scope MCP tools to a workspace |
| `MCP_AGENT_ID` | Attribution hint for agent registry |

See [GUIDE.md § 3](GUIDE.md#3-security).

---

## Tier 1 — Default stack behavior (usually leave commented)

These have safe defaults. Uncomment only when you need the feature.

### Retrieval & graph

| Variable | Default | Purpose |
|----------|---------|---------|
| `HYBRID_RETRIEVAL` | `false` | Merge SQL + vector (RRF) in retrieval |
| `GRAPH_RETRIEVAL` | `false` | Add graph leg to composite retrieval |
| `GRAPH_MAX_DEPTH` | `2` | BFS depth cap (max 3) |
| `GRAPH_SEED_CAP` | `5` | Lexical seeds per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Neighbor budget for graph leg |
| `RETRIEVAL_RELATION_NEIGHBOR_CAP` | `5` | One-hop neighbors in `get_context` — lower if noisy |

Details: [GUIDE.md § 7](GUIDE.md#7-optional-commands).

### Embeddings (Phase 5)

| Variable | Default | Purpose |
|----------|---------|---------|
| `EMBEDDING_PROVIDER` | `noop` | `openai` or `local` for real vectors |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI-compatible model id |
| `EMBEDDING_API_KEY` | — | Required when provider is `openai` |
| `EMBEDDING_BASE_URL` | OpenAI URL | Custom OpenAI-compatible endpoint |

Run backfill after enabling: `npm run db:backfill-embeddings` → `:execute`.

---

## Tier 2 — Platform adapters (Phase 10)

**Master rule:** `SQL_PROVIDER=d1` and `OBJECT_STORAGE_PROVIDER=inline` unless you explicitly flip providers. All flags default **off** or **D1-centric**.

### SQL & vectors

| Variable | Default | Purpose |
|----------|---------|---------|
| `SQL_PROVIDER` | `d1` | `postgres` for Postgres metadata |
| `DATABASE_URL` | — | Postgres connection string when `SQL_PROVIDER=postgres` |
| `VECTOR_PROVIDER` | `d1` | `pgvector` for external vector table |
| `PGVECTOR_DATABASE_URL` | — | Override DB URL for pgvector |

### Object storage

| Variable | Default | Purpose |
|----------|---------|---------|
| `OBJECT_STORAGE_PROVIDER` | `inline` | `r2` or `s3` for large content offload |
| `R2_*` / `S3_*` | — | Bucket, keys, region, endpoint |

### Search & graph stores

| Variable | Default | Purpose |
|----------|---------|---------|
| `SEARCH_PROVIDER` | `sql` | `meilisearch` for external lexical index |
| `MEILISEARCH_*` | — | Host, API key, index name |
| `GRAPH_PROVIDER` | `d1` | `neo4j` for external graph DB |
| `NEO4J_*` | — | URI and credentials |

### Cache, events, analytics

| Variable | Default | Purpose |
|----------|---------|---------|
| `CACHE_PROVIDER` | `none` | `redis` for distributed cache |
| `REDIS_URL` | — | Redis/Valkey connection |
| `RATE_LIMIT_REDIS_URL` | — | Shared rate-limit counters (Vercel multi-instance) |
| `EVENT_BUS_PROVIDER` | `none` | `redis` for Redis Streams bus |
| `EVENT_CONSUMERS_ENABLED` | `false` | Run domain event consumers |
| `ANALYTICS_PROVIDER` | `none` | `duckdb` for dev analytics store |
| `DUCKDB_PATH` | `:memory:` | DuckDB file or in-memory |

### Enterprise (Phase 10)

| Variable | Default | Purpose |
|----------|---------|---------|
| `ENTERPRISE_RBAC` | `false` | Workspace membership RBAC |
| `MEMORY_ACCESS_AUDIT` | `false` | Audit trail for memory access |

Backfill scripts: [GUIDE.md § 8](GUIDE.md#8-platform-infrastructure-phases-10--11).

---

## Tier 3 — Extension tracks (opt-in features)

| Variable | Phase | Purpose |
|----------|-------|---------|
| `COMPRESSION_*` | 05.5 | Semantic compression + scheduler |
| `SIGNAL_INGEST_ENABLED` | 8.5 | Quality signals ingest |
| `LEARNING_ENGINE_ENABLED` | 8.6 | Ranking adaptation from signals |
| `INSPECTION_LEDGER_*` | 8.8 | Inspection pattern ledger |
| `PRECISION_SEARCH_*` | 6.6 | Structured / path-aware search modes |
| `RELATION_INFERENCE_ENABLED` | 8.7 | Async inferred graph edges |
| `MEMORY_EVOLUTION_*` | 09.7 | Version history, restore, merge |
| `MULTI_CLIENT_SYNC_*` | 09.8 | Pull/push sync across clients |
| `MEMORY_STEWARDSHIP_*` | 04.7 | Maintenance pipeline |

Enable **one track at a time** in staging; run `npm test` with flags off for regression baseline.

---

## Tier 4 — Transport & protocols

| Variable | Default | Purpose |
|----------|---------|---------|
| `GRPC_ENABLED` | `false` | gRPC server (long-running host, not Vercel) |
| `GRPC_PORT` / `GRPC_HOST` | `50051` / `0.0.0.0` | Bind address |
| `GRPC_TLS_*` | — | Optional mTLS cert + key paths |
| `SSE_ENABLED` | `false` | SSE context stream |
| `WEBSOCKET_ENABLED` | `false` | WebSocket transport |
| `REMOTE_MCP_*` | `false` | HTTPS `/mcp` for ChatGPT / web clients |
| `OTEL_*` | `false` | OpenTelemetry trace export |

Remote MCP: [GUIDE.md § 6.1](GUIDE.md#61-chatgpt).

---

## Tier 5 — Enterprise security (Phase 17)

| Variable | Default | Purpose |
|----------|---------|---------|
| `ENTERPRISE_SECURITY_V2` | `false` | Master gate for policy engine, SSO, quotas |
| `POLICY_ENGINE` | `none` | `opa` · `rule-based` · `allow-all` |
| `OPA_URL` | — | OPA HTTP API (e.g. `http://127.0.0.1:8181`) when `POLICY_ENGINE=opa` |
| `SSO_ENABLED` | `false` | OIDC federation |
| `OIDC_*` | — | Issuer, client id/secret |
| `QUOTA_*` | — | Rate/write quotas per owner |

**Authorization policy samples** (Rego) live in [policies/](policies/) — load them **into your OPA server**, not into Ratary directly. See [policies/README.md](policies/README.md).

---

## Tier 6 — Federation, cloud, observability, platforms

| Group | Key flags | Purpose |
|-------|-----------|---------|
| **Federation** (14) | `FEDERATION_ENABLED`, `FEDERATION_*` | Cross-node sync |
| **Cloud** (18) | `CONTROL_PLANE_ENABLED`, `USAGE_METER_*` | Control plane + metering |
| **Observability** (19) | `OBSERVABILITY_PLATFORM`, `OBS_*`, `OTEL_*` | Metrics, logs, cost gauges — [observability/](../observability/) |
| **Plugin marketplace** (20) | `PLUGIN_MARKETPLACE_*` | Local catalog — [../infrastructure/marketplace/catalog.json](../infrastructure/marketplace/catalog.json) |
| **Search/graph prod** (21) | `SEARCH_GRAPH_PLATFORM_*` | Meilisearch/Neo4j sync ops |
| **Content scale** (22) | `CONTENT_SCALE_*` | R2/pgvector offload |
| **Knowledge fabric** (23) | `KNOWLEDGE_FABRIC_*`, `NOTION_*`, `GITHUB_*` | Connector ingest |
| **Ratary platform** (24) | `RATARY_PLATFORM_*`, `PLATFORM_WEBHOOKS_*` | Edition + webhooks |

---

## Client packages (MCP / CLI / SDK)

Used by `@ratary/mcp-server`, `@ratary/cli`, or remote MCP — not required for in-repo stdio MCP.

| Variable | Purpose |
|----------|---------|
| `RATARY_BASE_URL` | Hosted Ratary REST origin |
| `RATARY_API_KEY` | `aic_...` from bootstrap |
| `RATARY_WORKSPACE_ID` | Optional workspace scope |
| `RATARY_FEDERATION` | Federation client mode |

Legacy aliases `AI_BRAIN_*` still accepted.

Examples: [examples/mcp/remote-api.mcp.json.example](examples/mcp/remote-api.mcp.json.example).

---

## Developer / backup scripts

| Variable | Purpose |
|----------|---------|
| `BACKUP_ROOT` | Folder watched by `npm run sync:backups:watch` |
| `BACKUP_SYNC_DEBOUNCE_MS` | Debounce for file watcher |
| `BACKUP_SYNC_POLL_MS` | Poll interval |

---

## Related folders (not env)

| Path | What it is | Not the same as |
|------|------------|-----------------|
| [examples/](examples/) | MCP JSON & IDE **templates** to copy | `.env` |
| [policies/](policies/) | **Authorization** Rego samples for OPA | env “policies” or Rego in `.env` |
| [../observability/](../observability/) | Grafana JSON + SLO **assets** served by API | docs-only |
| [../infrastructure/marketplace/](../infrastructure/marketplace/) | Plugin **catalog** when marketplace enabled | npm registry |

---

*Canonical variable list: [.env.example](../.env.example). Behavior authority: `src/config/env.ts`.*
