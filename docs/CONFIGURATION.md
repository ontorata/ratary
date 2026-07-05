# Configuration Reference

**Purpose:** Explain **what each feature does**, **pros and cons**, **runtime effects**, and **which env vars to set**.  
**Template file:** [.env.example](../.env.example) (copy → `.env` — never commit `.env`)  
**How-to workflows:** [GUIDE.md](GUIDE.md) (setup, MCP, backfill commands)  
**Documentation index:** [README.md](README.md)

---

## How to use this document

| You want to… | Read |
|--------------|------|
| First install (D1 + MCP) | [GUIDE.md § 1](GUIDE.md#1-setup) — **Tier 0** vars below |
| Turn on Postgres / Redis / enterprise flags | **Tier 2+** here + [GUIDE.md § 8](GUIDE.md#8-platform-infrastructure) for backfill commands |
| Copy MCP or IDE config | [examples/](examples/) — not env vars |
| Write authorization rules (Rego) | [policies/](policies/) — separate from env |
| Grafana / Prometheus | [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) |

**Convention in `.env.example`:**

- Uncomment and set a variable to **opt in** to that feature.
- Commented lines show **defaults** — Ratary runs without them on a fresh D1 install.
- `true`/`false` flags use string values in `.env` (e.g. `HYBRID_RETRIEVAL=true`).

**Reading each feature block:**

| Field | Meaning |
|-------|---------|
| **What it does** | Role in the system |
| **Pros / Cons** | Trade-offs for enabling |
| **Effects when enabled** | What changes at runtime |
| **Key variables** | Env vars to set |

---

## Tier 0 — Required for local brain (D1 + MCP stdio)

### Cloudflare D1 + REST auth

**What it does:** Connects Ratary to your D1 database and secures REST API keys.

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account for D1 HTTP API |
| `D1_DATABASE_ID` | Yes | Target D1 database UUID |
| `D1_API_TOKEN` | Yes | API token with D1 read/write |
| `AUTH_SECRET` | Yes (REST) | HMAC secret for API keys — `openssl rand -hex 32` |
| `NODE_ENV` | Recommended | `development` local · `production` deployed |
| `PORT` | Optional | REST port (default `3000`) |
| `LOG_LEVEL` | Optional | `info` typical |

**Pros:** Zero local database install; works with MCP stdio immediately.  
**Cons:** D1 is Cloudflare-bound; not ideal for all enterprise Postgres workflows.  
**Effects:** Without these, neither REST nor stdio MCP can persist memory.

See [GUIDE.md § 1](GUIDE.md#1-setup).

---

### MCP memory scope

**What it does:** Restricts MCP tools to a specific owner, workspace, or agent so memory does not leak across tenants.

| Variable | Purpose |
|----------|---------|
| `MCP_OWNER_ID` | Isolate memory to one owner UUID (from bootstrap) |
| `MCP_WORKSPACE_ID` | Scope MCP tools to a workspace |
| `MCP_AGENT_ID` | Attribution hint for agent registry |

**Pros:** Strong isolation in production; supports multi-workspace teams.  
**Cons:** Must bootstrap first to obtain owner UUID; misconfiguration blocks MCP startup in production.  
**Effects:** In `NODE_ENV=production`, MCP stdio **refuses to start** without `MCP_OWNER_ID`. REST can use `X-Workspace-Id` / `X-Agent-Id` headers similarly.

See [GUIDE.md § 3](GUIDE.md#3-security).

---

## Tier 1 — Default stack behavior (usually leave commented)

Safe defaults. Enable only when you need the capability.

### Hybrid retrieval

**What it does:** Merges lexical/SQL results with vector similarity using reciprocal rank fusion (RRF) so semantic matches surface alongside keyword hits.

| Variable | Default |
|----------|---------|
| `HYBRID_RETRIEVAL` | `false` |

**Pros:** Better recall when wording differs from stored text; pairs well with embeddings.  
**Cons:** Requires a real embedding provider and backfilled vectors; slightly higher retrieval latency.  
**Effects:** `get_context` and related retrieval paths run SQL + vector legs and merge ranks. No effect on plain CRUD.

**Related tuning:** `RETRIEVAL_POLICY`, `RETRIEVAL_POLICY_VERSION` (extension tracks).

---

### Graph retrieval

**What it does:** Adds a graph traversal leg to composite retrieval — follows memory relations from lexical seeds.

| Variable | Default | Purpose |
|----------|---------|---------|
| `GRAPH_RETRIEVAL` | `false` | Enable graph leg in retrieval |
| `GRAPH_MAX_DEPTH` | `2` | BFS depth cap (max 3) |
| `GRAPH_SEED_CAP` | `5` | Lexical seeds per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Neighbor budget per query |
| `RETRIEVAL_RELATION_NEIGHBOR_CAP` | `5` | One-hop neighbors in `get_context` |

**Pros:** Surfaces related decisions and linked memories users forgot to mention; good for dense knowledge graphs.  
**Cons:** Noisy on sparse graphs; dense graphs can inflate context — lower `RETRIEVAL_RELATION_NEIGHBOR_CAP` (e.g. 3).  
**Effects:** Retrieval pipeline adds graph BFS after seeds. Graph tools (`traverse_relations`, etc.) work **without** this flag for explicit exploration.

Commands: [GUIDE.md § 7](GUIDE.md#7-optional-commands).

---

### Embeddings

**What it does:** Generates vector representations of memory content for similarity search. Runs **asynchronously** — never on the CRUD hot path.

| Variable | Default | Purpose |
|----------|---------|---------|
| `EMBEDDING_PROVIDER` | `noop` | `openai`, `local`, or `noop` |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Model id |
| `EMBEDDING_API_KEY` | — | Required when provider is `openai` |
| `EMBEDDING_BASE_URL` | OpenAI URL | Custom compatible endpoint |
| `EMBEDDING_BATCH_SIZE` | `32` | Batch size for backfill jobs |
| `EMBEDDING_JOB_MAX_MEMORIES` | `10000` | Cap per backfill run |

**Pros:** Enables semantic search and hybrid retrieval; provider-agnostic.  
**Cons:** API cost and latency for backfill; `noop` means no vectors until you backfill.  
**Effects:** New/changed memories queue embedding jobs. Delete cleans vectors. Run `npm run db:backfill-embeddings` → `:execute` after enabling.

---

## Tier 2 — Platform adapters

**Master rule:** Keep `SQL_PROVIDER=d1` and `OBJECT_STORAGE_PROVIDER=inline` unless you explicitly migrate. All adapters default **off** or **D1-centric**.

### Postgres metadata (`SQL_PROVIDER=postgres`)

**What it does:** Stores memory metadata in PostgreSQL instead of D1.

| Variable | Default |
|----------|---------|
| `SQL_PROVIDER` | `d1` |
| `DATABASE_URL` | — |

**Pros:** Standard RDBMS ops, backups, replicas; required path for many enterprise deploys.  
**Cons:** Migration from D1 needed; you operate Postgres.  
**Effects:** All SQL-backed repositories use Postgres. Run schema apply + D1 backfill — [GUIDE.md § 8](GUIDE.md#8-platform-infrastructure).

---

### External vectors (`VECTOR_PROVIDER=pgvector`)

**What it does:** Stores embedding vectors in pgvector instead of D1 blob columns.

| Variable | Default |
|----------|---------|
| `VECTOR_PROVIDER` | `d1` |
| `PGVECTOR_DATABASE_URL` | — (falls back to `DATABASE_URL`) |

**Pros:** Scales vector search; co-locate with Postgres metadata.  
**Cons:** Extra schema and backfill; hybrid retrieval still needs embeddings enabled.  
**Effects:** Vector reads/writes go to pgvector table. Backfill: `npm run db:backfill-pgvector`.

---

### Object storage offload (`OBJECT_STORAGE_PROVIDER=r2|s3`)

**What it does:** Moves large memory bodies to R2 or S3; metadata stays in SQL provider.

| Variable | Default |
|----------|---------|
| `OBJECT_STORAGE_PROVIDER` | `inline` |
| `R2_*` / `S3_*` | bucket, keys, region, endpoint |

**Pros:** Keeps SQL rows small; cheaper bulk storage.  
**Cons:** Another service to secure and monitor; slight read latency for offloaded bodies.  
**Effects:** Bodies above inline threshold stored externally. See `CONTENT_SCALE_*` for ops automation.

---

### External lexical search (`SEARCH_PROVIDER=meilisearch`)

**What it does:** Indexes memory text in Meilisearch for fast full-text browse/search.

| Variable | Default |
|----------|---------|
| `SEARCH_PROVIDER` | `sql` |
| `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `MEILISEARCH_INDEX` | — |

**Pros:** Sub-second fuzzy search at scale; typo tolerance.  
**Cons:** Sync lag until backfill; another cluster to run.  
**Effects:** Search/browse APIs prefer Meilisearch index. Backfill: `npm run db:backfill-meilisearch`.

---

### External graph store (`GRAPH_PROVIDER=neo4j`)

**What it does:** Persists relation edges in Neo4j for heavy graph workloads.

| Variable | Default |
|----------|---------|
| `GRAPH_PROVIDER` | `d1` |
| `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` | — |

**Pros:** Native graph queries at large edge counts.  
**Cons:** Operational overhead; D1 graph sufficient for many teams.  
**Effects:** Relation writes/traversals use Neo4j adapter. Backfill: `npm run db:backfill-neo4j`.

---

### Redis cache

**What it does:** Distributed cache for hot reads (capabilities, repeated lookups).

| Variable | Default |
|----------|---------|
| `CACHE_PROVIDER` | `none` |
| `REDIS_URL` | — |
| `REDIS_KEY_PREFIX` | `ai-brain:cache:` |

**Pros:** Lower latency on multi-instance deploys.  
**Cons:** Cache invalidation complexity; stale reads if misconfigured.  
**Effects:** Cache adapter active; no change to persistence semantics.

---

### Rate limiting (Redis)

**What it does:** Shared rate-limit counters across serverless instances (e.g. Vercel).

| Variable | Purpose |
|----------|---------|
| `RATE_LIMIT_REDIS_URL` | Dedicated Redis for rate limits |

**Pros:** Consistent throttling per IP/key across replicas.  
**Cons:** Requires Upstash or self-hosted Redis.  
**Effects:** Without it, rate limits are per-instance only on serverless.

---

### Event bus (Redis Streams)

**What it does:** Publishes domain events for async consumers (embedding, compression, etc.).

| Variable | Default |
|----------|---------|
| `EVENT_BUS_PROVIDER` | `none` |
| `EVENT_CONSUMERS_ENABLED` | `false` |
| `REDIS_STREAM_PREFIX` | `ai-brain:events:` |

**Pros:** Decouples heavy work from request path; enables horizontal workers.  
**Cons:** Requires Redis and consumer processes.  
**Effects:** With `EVENT_CONSUMERS_ENABLED=true`, background workers process queued jobs.

---

### Analytics (DuckDB)

**What it does:** Local/dev analytics store for signals and usage experiments.

| Variable | Default |
|----------|---------|
| `ANALYTICS_PROVIDER` | `none` |
| `DUCKDB_PATH` | `:memory:` |

**Pros:** Fast analytical queries without a warehouse.  
**Cons:** Not a production BI replacement; file path needed for persistence.  
**Effects:** Signal/analytics writes route to DuckDB when enabled.

---

### Workspace RBAC & audit

**What it does:** Enforces workspace membership on memory APIs and logs access events.

| Variable | Default |
|----------|---------|
| `ENTERPRISE_RBAC` | `false` |
| `MEMORY_ACCESS_AUDIT` | `false` |

**Pros:** Team isolation and compliance trail.  
**Cons:** Setup overhead; all clients must send workspace context.  
**Effects:** Unauthorized workspace access denied; audit rows appended when audit enabled.

---

## Tier 3 — Extension tracks (opt-in features)

Enable **one track at a time** in staging. Keep defaults for regression baseline.

### Semantic compression

**What it does:** Summarizes or compacts memory bodies to save tokens and storage.

| Key variables | `COMPRESSION_ENABLED`, `COMPRESSION_POLICY`, `COMPRESSION_SCHEDULER`, `SUMMARIZER_*` |

**Pros:** Lower storage and retrieval token cost; cleaner long-term memory.  
**Cons:** LLM summarization cost if `COMPRESSION_POLICY=llm`; irreversible without version history.  
**Effects:** Scheduler queues compression jobs. CLI: `npm run compress:memories`.

---

### Quality signals & learning

**What it does:** Ingests feedback signals and optionally adapts ranking weights over time.

| Key variables | `SIGNAL_INGEST_ENABLED`, `RANKING_ADAPTATION_ENABLED`, `LEARNING_ENGINE_ENABLED`, `LEARNING_STORE_PROVIDER` |

**Pros:** Retrieval improves from real usage patterns.  
**Cons:** Needs signal volume; harder to debug ranking changes.  
**Effects:** `submit_signal` MCP tool feeds store; learning engine updates policy snapshots async.

---

### Inspection ledger

**What it does:** Records inspection outcomes for future pattern mining and charter workflows.

| Key variables | `INSPECTION_LEDGER_ENABLED`, `INSPECTION_LEDGER_STORE_PROVIDER`, `INSPECTION_CHARTER_ENABLED` |

**Pros:** Audit trail for automated review pipelines.  
**Cons:** Storage growth; niche for most solo devs.  
**Effects:** Inspection signals persisted when enabled.

---

### Precision search

**What it does:** Structured filters, path-aware search, multi-query RRF, optional rerank.

| Key variables | `PRECISION_SEARCH_ENABLED`, `SEARCH_DEFAULT_MODE`, `MULTI_QUERY_RRF_K`, `SEARCH_RERANK_ENABLED`, `RERANK_MODEL_PATH` |

**Pros:** Fine-grained search for power users and agents.  
**Cons:** More tuning surface; rerank adds latency.  
**Effects:** Search MCP/REST tools expose additional modes and boosts.

---

### Relation inference

**What it does:** Async inference of new `memory_relations` edges from content similarity.

| Key variables | `RELATION_INFERENCE_ENABLED`, `RELATION_INFERENCE_STORE_PROVIDER` |

**Pros:** Graph grows automatically; less manual linking.  
**Cons:** False-positive edges possible; needs periodic stewardship.  
**Effects:** Background jobs propose/write inferred relations.

---

### Memory evolution (version control)

**What it does:** Immutable version chain per memory with restore and merge.

| Key variables | `MEMORY_EVOLUTION_ENABLED`, `MEMORY_EVOLUTION_STORE_PROVIDER` |

**Pros:** Safe edits; rollback bad agent writes.  
**Cons:** Storage multiplier; API complexity.  
**Effects:** REST version endpoints active; each update creates version row.

---

### Multi-client sync

**What it does:** Pull/push memory deltas across clients with conflict resolution.

| Key variables | `MULTI_CLIENT_SYNC_ENABLED`, `MULTI_CLIENT_SYNC_STORE_PROVIDER`, `MULTI_CLIENT_SYNC_STRATEGY` (default `lww`) |

**Pros:** Same brain across devices/offline clients.  
**Cons:** Conflict edge cases; requires sync-aware clients.  
**Effects:** MCP `sync_pull`, `sync_push`, `sync_status` persist sync state.

---

### Memory stewardship

**What it does:** Deterministic maintenance pipeline (dedupe hints, stale cleanup, compression triggers).

| Key variables | `MEMORY_STEWARDSHIP_ENABLED`, `MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER`, `MEMORY_STEWARDSHIP_SCHEDULER` |

**Pros:** Hands-off hygiene for long-running brains.  
**Cons:** Aggressive rules can archive wanted memories — test in dry-run.  
**Effects:** MCP `run_stewardship`; scheduled runs when scheduler set.

---

## Tier 4 — Transport & protocols

### gRPC

**What it does:** Binary RPC transport sharing handlers with REST/MCP.

| Key variables | `GRPC_ENABLED`, `GRPC_PORT`, `GRPC_HOST`, `GRPC_TLS_*` |

**Pros:** Efficient streaming for internal callers.  
**Cons:** Requires long-running host (not Vercel serverless); TLS ops burden.  
**Effects:** gRPC server binds alongside REST when enabled.

---

### SSE context streaming

**What it does:** Server-sent events stream for progressive context delivery.

| Key variables | `SSE_ENABLED`, `SSE_MAX_CONCURRENT_PER_IP`, rate limit vars |

**Pros:** Lower time-to-first-token for large context builds.  
**Cons:** Long-lived connections; not serverless-friendly.  
**Effects:** `GET /api/v1/context/stream` available. Endpoint: [GUIDE.md § 7](GUIDE.md#7-optional-commands).

---

### WebSocket

**What it does:** Bidirectional WebSocket transport for real-time clients.

| Key variables | `WEBSOCKET_ENABLED`, `WEBSOCKET_PATH` |

**Pros:** Interactive UIs and live updates.  
**Cons:** Connection management complexity.  
**Effects:** WebSocket route mounted at configured path.

---

### Remote MCP (ChatGPT / web)

**What it does:** HTTPS MCP endpoint at `/mcp` for clients that cannot run stdio.

| Key variables | `REMOTE_MCP_ENABLED`, `REMOTE_MCP_PATH`, `REMOTE_MCP_PUBLIC_URL`, `REMOTE_MCP_CORS_ORIGINS`, `REMOTE_MCP_OAUTH_ENABLED` |

**Pros:** ChatGPT New App, web MCP hosts connect without local install.  
**Cons:** Needs long-running Node host; SSE sessions fragile on pure serverless.  
**Effects:** MCP protocol served over HTTP; OAuth discovery when OAuth enabled. See [GUIDE.md § 6.1](GUIDE.md#61-chatgpt).

---

### OpenTelemetry traces

**What it does:** Exports distributed traces to an OTLP collector.

| Key variables | `OTEL_ENABLED`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT` |

**Pros:** Debug latency across retrieval pipeline.  
**Cons:** Collector infrastructure required.  
**Effects:** Spans emitted on instrumented paths; no user-visible API change.

---

## Tier 5 — Enterprise security

**What it does:** Central gate for policy engine, SSO, and quotas.

| Variable | Default | Purpose |
|----------|---------|---------|
| `ENTERPRISE_SECURITY_V2` | `false` | Master enable |
| `POLICY_ENGINE` | `none` | `opa` · `rule-based` · `allow-all` |
| `OPA_URL` | — | OPA HTTP API when `POLICY_ENGINE=opa` |
| `SSO_ENABLED` | `false` | OIDC federation |
| `OIDC_*` | — | Issuer, client id/secret |
| `QUOTA_*` | — | Rate/write quotas per owner |

**Pros:** Enterprise authz (OPA/Rego), SSO, quota enforcement.  
**Cons:** Operational complexity — OPA cluster, IdP integration, policy authoring.  
**Effects:** API requests evaluated against policy engine; SSO replaces bootstrap-only auth when enabled; quotas return 429 when exceeded.

**Authorization samples:** [policies/](policies/) — load Rego into OPA, not Ratary directly. See [policies/README.md](policies/README.md).

---

## Tier 6 — Federation, cloud, observability, platforms

### Federation

**What it does:** Cross-node knowledge exchange between Ratary instances.

| Key variables | `FEDERATION_ENABLED`, `FEDERATION_NODE_ID`, `FEDERATION_PEERS_JSON`, trust/policy providers |

**Pros:** Multi-region or multi-tenant brain mesh.  
**Cons:** Trust configuration critical; sync conflict handling.  
**Effects:** Federation APIs and peer transport active.

---

### Cloud control plane & metering

**What it does:** Control-plane metadata, usage metering, DR hooks.

| Key variables | `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED`, `CLOUD_*` |

**Pros:** Hosted-style ops on self-managed infra.  
**Cons:** Mostly relevant for platform operators.  
**Effects:** Usage records persisted; cost gauges available with observability flags.

---

### Observability platform

**What it does:** Prometheus metrics, log shipping, Grafana dashboards, cost estimates.

| Key variables | `OBSERVABILITY_PLATFORM`, `OBS_METRICS_PATH`, `OBS_LOG_SHIPPER`, `OBS_LOKI_PUSH_URL`, `OBS_COST_METRICS_ENABLED`, `COST_*` |

**Pros:** Production visibility; SLO dashboards in `observability/`.  
**Cons:** External Prometheus/Grafana/Loki stack.  
**Effects:** `/metrics` exposed; dashboards importable. See [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) and [GUIDE.md § 10](GUIDE.md#10-observability).

---

### Plugin marketplace

**What it does:** Load and verify plugins from local catalog.

| Key variables | `PLUGIN_MARKETPLACE_ENABLED`, `PLUGIN_SIGNATURE_REQUIRED`, `PLUGIN_TRUSTED_PUBLIC_KEYS`, `PLUGIN_MARKETPLACE_SOURCE` |

**Pros:** Extend Ratary without forking core.  
**Cons:** Signature trust management; supply-chain risk if keys misconfigured.  
**Effects:** Plugin enable/install APIs gated by marketplace + policy engine.

Catalog: [../infrastructure/marketplace/catalog.json](../infrastructure/marketplace/catalog.json).

---

### Search & graph production ops

**What it does:** Operational sync jobs for Meilisearch/Neo4j at scale.

| Key variables | `SEARCH_GRAPH_PLATFORM_ENABLED`, `GRAPH_VECTOR_SEEDS_ENABLED` |

**Pros:** Keeps external indexes consistent under load.  
**Cons:** Background job monitoring required.  
**Effects:** Scheduled sync workers run when platform flag enabled.

---

### Content & vector scale

**What it does:** Automated offload to R2/pgvector with ops tooling.

| Key variables | `CONTENT_SCALE_PLATFORM_ENABLED`, `CONTENT_OFFLOAD_MIN_BYTES`, `CONTENT_OFFLOAD_CLEAR_INLINE` |

**Pros:** Hands-off large-body migration.  
**Cons:** Irreversible inline clear if misconfigured.  
**Effects:** Bodies migrated per threshold rules.

---

### Knowledge fabric (connectors)

**What it does:** Ingest from external systems (Notion, GitHub, catalog JSON).

| Key variables | `KNOWLEDGE_FABRIC_ENABLED`, `KNOWLEDGE_FABRIC_CATALOG_JSON`, `NOTION_API_TOKEN`, `GITHUB_TOKEN` |

**Pros:** Unified brain from existing tools of record.  
**Cons:** Token scope security; ingest volume management.  
**Effects:** Connector jobs write memories on schedule/trigger.

---

### Ratary platform umbrella

**What it does:** Edition flags and outbound webhooks for platform integrations.

| Key variables | `RATARY_PLATFORM_ENABLED`, `RATARY_PLATFORM_EDITION`, `PLATFORM_WEBHOOKS_ENABLED` |

**Pros:** SKU differentiation; event-driven integrations.  
**Cons:** Webhook delivery monitoring needed.  
**Effects:** Webhook payloads fire on configured domain events.

---

## Client packages (MCP / CLI / SDK)

**What it does:** Connect `@ratary/mcp-server`, `@ratary/cli`, or SDK scripts to a **hosted** Ratary — not needed for in-repo stdio MCP.

| Variable | Purpose |
|----------|---------|
| `RATARY_BASE_URL` | Hosted Ratary REST origin |
| `RATARY_API_KEY` | `aic_...` from bootstrap |
| `RATARY_WORKSPACE_ID` | Optional workspace scope |
| `RATARY_FEDERATION` | Federation client mode |

Legacy aliases `AI_BRAIN_*` still accepted.

**Pros:** Same brain from any machine without D1 creds in IDE config.  
**Cons:** Requires deployed server and API key rotation discipline.  
**Effects:** npm MCP proxy exposes 6 tools vs 28 for local stdio.

Example: [examples/mcp/remote-api.mcp.json.example](examples/mcp/remote-api.mcp.json.example).

---

## Developer / backup scripts

**What it does:** Watch a local folder and sync chat exports into D1.

| Variable | Purpose |
|----------|---------|
| `BACKUP_ROOT` | Folder watched by `npm run sync:backups:watch` |
| `BACKUP_SYNC_DEBOUNCE_MS` | Debounce for file watcher |
| `BACKUP_SYNC_POLL_MS` | Poll interval |

**Pros:** Recover IDE chat logs into durable memory.  
**Cons:** One-way sync — not a backup restore tool for full DB.  
**Effects:** New/changed files under `BACKUP_ROOT` create or update memories.

---

## Related folders (not env)

| Path | What it is | Not the same as |
|------|------------|-----------------|
| [examples/](examples/) | MCP JSON & IDE **templates** to copy | `.env` |
| [policies/](policies/) | **Authorization** Rego samples for OPA | env “policies” |
| [../observability/](../observability/) | Grafana JSON + SLO **assets** | docs-only |
| [../infrastructure/marketplace/](../infrastructure/marketplace/) | Plugin **catalog** | npm registry |

---

*Canonical variable list: [.env.example](../.env.example). Behavior authority: `src/config/env.ts`.*
