# Configuration Reference

**Purpose:** Explain **what each feature does**, **when to enable it**, and **what changes at runtime**.  
**Template file:** [.env.example](../.env.example) (copy → `.env` — never commit `.env`)  
**How-to workflows:** [GUIDE.md](GUIDE.md) (setup, MCP, backfill commands)  
**Documentation index:** [README.md](README.md)

> **Pick your SQL metadata store** — D1, Postgres, Supabase, MariaDB/MySQL, TiDB, and CockroachDB are **peer choices** via `SQL_PROVIDER`, not a ladder with D1 as the reference deployment. Tier 0 covers auth and MCP scope; SQL connection vars depend on the provider you select. Optional adapters (vectors, object storage, search) are documented in Tier 2+.

> **First install:** configure **Tier 0 + Tier 1** in [`.env.example`](../.env.example) only, then run `npm run setup`. Do not enable Tier 2+ or enterprise flags until you need them.

---

## How to use this document

| You want to… | Read |
|--------------|------|
| First install | [GUIDE — Setup](GUIDE.md#1-setup) — pick SQL stack + **Tier 0** vars below |
| Turn on Postgres / MariaDB / Redis / enterprise flags | **Tier 2+** here + [GUIDE — Platform infrastructure](GUIDE.md#8-platform-infrastructure) for backfill commands |
| Copy MCP or IDE config | [examples/](examples/) — not env vars |
| Write authorization rules (Rego) | [policies/](policies/) — separate from env |
| Grafana / Prometheus | [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) |

**Convention in `.env.example`:**

- Tiered layout mirrors this document: **Tier 0–1** = first install; **Tier 2+** = opt-in adapters and features.
- Uncomment and set a variable to **opt in** to that feature.
- Commented lines show **template defaults** in `.env.example` — override `SQL_PROVIDER` and credentials for your chosen database.
- `true`/`false` flags use string values in `.env` (e.g. `HYBRID_RETRIEVAL=true`).
- Comment-only edits must **preserve every variable name** — do not add or remove keys without a code change.

**Reading each feature block:**

| Field | Meaning |
|-------|---------|
| **What it does** | Role in the system |
| **Benefits** | Why teams enable this (opt-in features) |
| **Requirements** | What Tier 0 needs — credentials and guardrails |
| **Before enabling** | Checklist before uncommenting optional flags |
| **Effects when enabled** | What changes at runtime |
| **Key variables** | Env vars to set |

---

## Tier 0 — Core required (SQL + auth + MCP)

### SQL metadata store (choose one)

Ratary persists memory metadata through **`ISqlDatabase`** — same application code, different adapter per `SQL_PROVIDER`.

| Stack | `SQL_PROVIDER` | Required env | `.env.example` block |
|-------|----------------|--------------|----------------------|
| **PostgreSQL** *(template default)* | `postgres` | `DATABASE_URL` | Tier 1 — PostgreSQL |
| **Supabase** | `supabase` | `DATABASE_URL` (from Supabase dashboard) | Tier 1 — Supabase |
| **Cloudflare D1** | `d1` | `CLOUDFLARE_*`, `D1_*` | Tier 1 — Cloudflare D1 |
| **MariaDB / MySQL** | `mariadb` / `mysql` | `MARIADB_CONNECTION_STRING` | Tier 1 — MariaDB / MySQL |
| **TiDB / CockroachDB** | `tidb` / `cockroachdb` | `DATABASE_URL` (Postgres wire) | Tier 1 — TiDB / CockroachDB |

Pick **one** row. All paths support the same MCP tools and REST API.

---

### Cloudflare D1 (`SQL_PROVIDER=d1`)

**What it does:** Connects Ratary to Cloudflare D1 via the HTTP API.

| Variable | Required when `SQL_PROVIDER=d1` | Purpose |
|----------|----------------------------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account for D1 HTTP API |
| `D1_DATABASE_ID` | Yes | Target D1 database UUID |
| `D1_API_TOKEN` | Yes | API token with D1 read/write |
| `AUTH_SECRET` | Yes (REST) | HMAC secret for API keys — `openssl rand -hex 32` |
| `NODE_ENV` | Recommended | `development` local · `production` deployed |
| `PORT` | Optional | REST port (default `3000`) |
| `LOG_LEVEL` | Optional | `info` typical |

**Benefits:** Serverless metadata on Cloudflare; no local RDBMS install.  
**Requirements:** D1 credentials and `AUTH_SECRET` when this provider is selected.  
**Effects:** Without SQL credentials + auth, neither REST nor stdio MCP can persist memory.

See [GUIDE — Setup](GUIDE.md#1-setup).

---

### MCP memory scope

**What it does:** Restricts MCP tools to a specific owner, workspace, or agent so memory does not leak across tenants.

| Variable | Purpose |
|----------|---------|
| `MCP_OWNER_ID` | Isolate memory to one owner UUID (from bootstrap) |
| `MCP_WORKSPACE_ID` | Scope MCP tools to a workspace |
| `MCP_AGENT_ID` | Attribution hint for agent registry |

**Benefits:** Strong isolation in production; supports multi-workspace teams.  
**Production requirement:** Set `MCP_OWNER_ID` after bootstrap — intentional guard; MCP refuses to start in production without it so memory cannot run unscoped.  
**Effects:** In `NODE_ENV=production`, MCP stdio **refuses to start** without `MCP_OWNER_ID`. REST can use `X-Workspace-Id` / `X-Agent-Id` headers similarly.

See [GUIDE — Security](GUIDE.md#3-security).

---

## Tier 1 — Default stack behavior (usually leave commented)

Safe defaults. Enable only when you need the capability.

### Hybrid retrieval

**What it does:** Merges lexical/SQL results with vector similarity using reciprocal rank fusion (RRF) so semantic matches surface alongside keyword hits.

| Variable | Default |
|----------|---------|
| `HYBRID_RETRIEVAL` | `false` |

**Benefits:** Better recall when wording differs from stored text; pairs well with embeddings.  
**Before enabling:** Set `EMBEDDING_PROVIDER` and run embedding backfill first; expect modest retrieval latency increase.  
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

**Benefits:** Surfaces related decisions and linked memories users forgot to mention; good for dense knowledge graphs.  
**Before enabling:** Tune `RETRIEVAL_RELATION_NEIGHBOR_CAP` in staging (try 3 on dense graphs); sparse graphs may return little graph context until relations exist.  
**Effects:** Retrieval pipeline adds graph BFS after seeds. Graph tools (`traverse_relations`, etc.) work **without** this flag for explicit exploration.

Commands: [GUIDE — Optional commands](GUIDE.md#7-optional-commands).

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

**Benefits:** Enables semantic search and hybrid retrieval; provider-agnostic.  
**Before enabling:** Configure embedding provider and budget for backfill API cost; default `noop` skips vectors until backfill runs.  
**Effects:** New/changed memories queue embedding jobs. Delete cleans vectors. Run `npm run db:backfill-embeddings` → `:execute` after enabling.

---

## Tier 2 — Platform adapters

**Master rule:** Set **`SQL_PROVIDER`** to your metadata database (see [Tier 0 SQL table](#sql-metadata-store-choose-one)). Enable object storage, vectors, search, and analytics adapters only when you need them — each is independent of the SQL choice.

### Postgres metadata (`SQL_PROVIDER=postgres`)

**What it does:** Stores memory metadata in PostgreSQL.

| Variable | When required |
|----------|---------------|
| `SQL_PROVIDER` | `postgres` |
| `DATABASE_URL` | Yes |

**Benefits:** Standard RDBMS ops, backups, replicas; pairs with pgvector and Docker compose.  
**Before enabling:** Apply schema and run data import if migrating from another SQL provider ([GUIDE — Platform infrastructure](GUIDE.md#8-platform-infrastructure)).  
**Effects:** All SQL-backed repositories use the Postgres adapter.

---

### MariaDB / MySQL metadata (`SQL_PROVIDER=mariadb|mysql`)

**What it does:** Stores memory metadata in MariaDB or MySQL.

| Variable | When required |
|----------|---------------|
| `SQL_PROVIDER` | `mariadb` or `mysql` |
| `MARIADB_CONNECTION_STRING` | Yes (`mysql://` or `mariadb://` URI) |

**Benefits:** Fits existing MySQL/MariaDB ops teams and Galera/RDS stacks.  
**Before enabling:** Apply the same metadata schema as Postgres; verify dialect compatibility in staging.  
**Effects:** All SQL-backed repositories use the MariaDB adapter (`mysql2` pool).

---

### TiDB / CockroachDB metadata (`SQL_PROVIDER=tidb|cockroachdb`)

**What it does:** Uses the Postgres wire-protocol adapter against TiDB or CockroachDB.

| Variable | When required |
|----------|---------------|
| `SQL_PROVIDER` | `tidb` or `cockroachdb` |
| `DATABASE_URL` | Yes (Postgres-compatible URI) |

**Benefits:** Distributed SQL without a separate adapter implementation.  
**Before enabling:** Confirm your cluster supports the Postgres dialect features Ratary migrations require.  
**Effects:** Same code path as `SQL_PROVIDER=postgres`.

---

### Supabase metadata (`SQL_PROVIDER=supabase`)

**What it does:** Uses the Postgres wire-protocol adapter against [Supabase](https://supabase.com) hosted Postgres (same engine as self-hosted Postgres).

| Variable | When required |
|----------|---------------|
| `SQL_PROVIDER` | `supabase` |
| `DATABASE_URL` | Yes — **URI** from Supabase → **Project Settings → Database → Connection string** |

**Benefits:** Managed Postgres with optional [pgvector](https://supabase.com/docs/guides/database/extensions/pgvector) on the same database — set `VECTOR_PROVIDER=pgvector` without a separate vector host.  
**Before enabling:** Run `npm run db:apply-postgres-schema` once against the Supabase database (use **Session** or **Direct** connection for DDL; transaction pooler `:6543` is fine for app runtime).  
**Effects:** Same adapter as `SQL_PROVIDER=postgres`; manifest reports `sqlProvider: supabase`.

**Example `.env`:**

```env
SQL_PROVIDER=supabase
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
AUTH_SECRET=your_auth_secret_min_32_characters_long
# Optional — Supabase includes pgvector:
# VECTOR_PROVIDER=pgvector
```

---

### External vectors (`VECTOR_PROVIDER=pgvector`)

**What it does:** Stores embedding vectors in pgvector (separate from inline SQL vector columns).

| Variable | Default |
|----------|---------|
| `VECTOR_PROVIDER` | `d1` |
| `PGVECTOR_DATABASE_URL` | — (falls back to `DATABASE_URL`) |

**Benefits:** Scales vector search; co-locate with Postgres metadata.  
**Before enabling:** Extra schema and backfill; hybrid retrieval still needs embeddings enabled.  
**Effects:** Vector reads/writes go to pgvector table. Backfill: `npm run db:backfill-pgvector`.

---

### Object storage offload (`OBJECT_STORAGE_PROVIDER=r2|s3`)

**What it does:** Moves large memory bodies to R2 or S3; metadata stays in SQL provider.

| Variable | Default |
|----------|---------|
| `OBJECT_STORAGE_PROVIDER` | `inline` |
| `R2_*` / `S3_*` | bucket, keys, region, endpoint |

**Benefits:** Keeps SQL rows small; cheaper bulk storage.  
**Before enabling:** Another service to secure and monitor; slight read latency for offloaded bodies.  
**Effects:** Bodies above inline threshold stored externally. See `CONTENT_SCALE_*` for ops automation.

---

### MinIO object storage (`OBJECT_STORAGE_PROVIDER=minio`)

**What it does:** Offloads large memory bodies to MinIO (S3-compatible on-prem).

| Variable | Default |
|----------|---------|
| `OBJECT_STORAGE_PROVIDER` | `inline` |
| `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY_ID`, `MINIO_SECRET_ACCESS_KEY` | — |
| `MINIO_REGION` | `us-east-1` |
| `MINIO_USE_SSL` | `false` |

**Benefits:** Private-cloud S3 API without AWS; pairs with Docker `enterprise` compose profile.  
**Before enabling:** Create bucket and credentials; path-style access is enabled automatically.  
**Effects:** Same offload semantics as R2/S3 via the shared S3 command layer.

---

### Azure Blob / GCS object storage (`OBJECT_STORAGE_PROVIDER=azure|gcs`)

**What it does:** Offloads large memory bodies to Azure Blob Storage or Google Cloud Storage.

| Variable | Default |
|----------|---------|
| `OBJECT_STORAGE_PROVIDER` | `inline` |
| `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_CONTAINER_NAME` | — (Azure) |
| `GCS_BUCKET_NAME`, `GCS_KEY_FILE` | — (GCS; key file optional when ADC is configured) |

**Benefits:** Native cloud blob stores for enterprise procurement requirements.  
**Before enabling:** Container/bucket IAM and network egress policies.  
**Effects:** Same offload semantics as other object storage providers.

---

### External lexical search (`SEARCH_PROVIDER=meilisearch`)

**What it does:** Indexes memory text in Meilisearch for fast full-text browse/search.

| Variable | Default |
|----------|---------|
| `SEARCH_PROVIDER` | `sql` |
| `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `MEILISEARCH_INDEX` | — |

**Benefits:** Sub-second fuzzy search at scale; typo tolerance.  
**Before enabling:** Sync lag until backfill; another cluster to run.  
**Effects:** Search/browse APIs prefer Meilisearch index. Backfill: `npm run db:backfill-meilisearch`.

---

### OpenSearch lexical search (`SEARCH_PROVIDER=opensearch`)

**What it does:** Indexes memory text in OpenSearch (Elasticsearch-compatible) for cluster-scale search.

| Variable | Default |
|----------|---------|
| `SEARCH_PROVIDER` | `sql` |
| `OPENSEARCH_NODE`, `OPENSEARCH_INDEX` | — |
| `OPENSEARCH_USERNAME`, `OPENSEARCH_PASSWORD` | optional basic auth |

**Benefits:** HA search clusters with OpenSearch ecosystem plugins.  
**Before enabling:** Index mapping for `owner_id`, `workspace_id`, and searchable text fields.  
**Effects:** Lexical retrieval uses OpenSearch bool queries; hydrates hits from SQL metadata.

---

### External graph store (`GRAPH_PROVIDER=neo4j`)

**What it does:** Persists relation edges in Neo4j for heavy graph workloads.

| Variable | Default |
|----------|---------|
| `GRAPH_PROVIDER` | `d1` |
| `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` | — |

**Benefits:** Native graph queries at large edge counts.  
**Before enabling:** Operational overhead; built-in SQL graph leg is sufficient for many teams until edge counts grow.  
**Effects:** Relation writes/traversals use Neo4j adapter. Backfill: `npm run db:backfill-neo4j`.

---

### Redis cache

**What it does:** Distributed cache for hot reads (capabilities, repeated lookups).

| Variable | Default |
|----------|---------|
| `CACHE_PROVIDER` | `none` |
| `REDIS_URL` | — |
| `REDIS_KEY_PREFIX` | `ai-brain:cache:` |

**Benefits:** Lower latency on multi-instance deploys.  
**Before enabling:** Cache invalidation complexity; stale reads if misconfigured.  
**Effects:** Cache adapter active; no change to persistence semantics.

---

### Rate limiting (Redis)

**What it does:** Shared rate-limit counters across serverless instances (e.g. Vercel).

| Variable | Purpose |
|----------|---------|
| `RATE_LIMIT_REDIS_URL` | Dedicated Redis for rate limits |

**Benefits:** Consistent throttling per IP/key across replicas.  
**Before enabling:** Requires Upstash or self-hosted Redis.  
**Effects:** Without it, rate limits are per-instance only on serverless.

---

### Event bus (Redis Streams)

**What it does:** Publishes domain events for async consumers (embedding, compression, etc.).

| Variable | Default |
|----------|---------|
| `EVENT_BUS_PROVIDER` | `none` |
| `EVENT_CONSUMERS_ENABLED` | `false` |
| `REDIS_STREAM_PREFIX` | `ai-brain:events:` |

**Benefits:** Decouples heavy work from request path; enables horizontal workers.  
**Before enabling:** Requires Redis and consumer processes.  
**Effects:** With `EVENT_CONSUMERS_ENABLED=true`, background workers process queued jobs.

---

### Analytics (DuckDB)

**What it does:** Local/dev analytics store for signals and usage experiments.

| Variable | Default |
|----------|---------|
| `ANALYTICS_PROVIDER` | `none` |
| `DUCKDB_PATH` | `:memory:` |

**Benefits:** Fast analytical queries without a warehouse.  
**Before enabling:** Not a production BI replacement; file path needed for persistence.  
**Effects:** Signal/analytics writes route to DuckDB when enabled.

---

### Analytics (ClickHouse)

**What it does:** Production OLAP warehouse for memory-access aggregates and usage events.

| Variable | Default |
|----------|---------|
| `ANALYTICS_PROVIDER` | `none` |
| `CLICKHOUSE_URL` | — |
| `CLICKHOUSE_DATABASE` | `ratary` |
| `CLICKHOUSE_USERNAME` | `default` |
| `CLICKHOUSE_PASSWORD` | optional |

**Benefits:** Columnar analytics at billions of events; append-only event tables.  
**Before enabling:** Provision ClickHouse cluster; DDL runs on adapter startup.  
**Effects:** Analytics port routes inserts/queries to ClickHouse when enabled.

---

### Workspace RBAC & audit

**What it does:** Enforces workspace membership on memory APIs and logs access events.

| Variable | Default |
|----------|---------|
| `ENTERPRISE_RBAC` | `false` |
| `MEMORY_ACCESS_AUDIT` | `false` |

**Benefits:** Team isolation and compliance trail.  
**Before enabling:** Setup overhead; all clients must send workspace context.  
**Effects:** Unauthorized workspace access denied; audit rows appended when audit enabled.

---

## Tier 3 — Extension tracks (opt-in features)

Enable **one track at a time** in staging. Keep defaults for regression baseline.

### Semantic compression

**What it does:** Summarizes or compacts memory bodies to save tokens and storage.

| Key variables | `COMPRESSION_ENABLED`, `COMPRESSION_POLICY`, `COMPRESSION_SCHEDULER`, `SUMMARIZER_*` |

**Benefits:** Lower storage and retrieval token cost; cleaner long-term memory.  
**Before enabling:** Enable memory evolution first if you need rollback; budget for summarizer API when `COMPRESSION_POLICY=llm`.  
**Effects:** Scheduler queues compression jobs. CLI: `npm run compress:memories`.

---

### Quality signals & learning

**What it does:** Ingests feedback signals and optionally adapts ranking weights over time.

| Key variables | `SIGNAL_INGEST_ENABLED`, `RANKING_ADAPTATION_ENABLED`, `LEARNING_ENGINE_ENABLED`, `LEARNING_STORE_PROVIDER` |

**Benefits:** Retrieval improves from real usage patterns.  
**Before enabling:** Needs signal volume; harder to debug ranking changes.  
**Effects:** `submit_signal` MCP tool feeds store; learning engine updates policy snapshots async.

---

### Inspection ledger

**What it does:** Records inspection outcomes for future pattern mining and charter workflows.

| Key variables | `INSPECTION_LEDGER_ENABLED`, `INSPECTION_LEDGER_STORE_PROVIDER`, `INSPECTION_CHARTER_ENABLED` |

**Benefits:** Audit trail for automated review pipelines.  
**Before enabling:** Storage growth; niche for most solo devs.  
**Effects:** Inspection signals persisted when enabled.

---

### Precision search

**What it does:** Structured filters, path-aware search, multi-query RRF, optional rerank.

| Key variables | `PRECISION_SEARCH_ENABLED`, `SEARCH_DEFAULT_MODE`, `MULTI_QUERY_RRF_K`, `SEARCH_RERANK_ENABLED`, `RERANK_MODEL_PATH` |

**Benefits:** Fine-grained search for power users and agents.  
**Before enabling:** More tuning surface; rerank adds latency.  
**Effects:** Search MCP/REST tools expose additional modes and boosts.

---

### Relation inference

**What it does:** Async inference of new `memory_relations` edges from content similarity.

| Key variables | `RELATION_INFERENCE_ENABLED`, `RELATION_INFERENCE_STORE_PROVIDER` |

**Benefits:** Graph grows automatically; less manual linking.  
**Before enabling:** False-positive edges possible; needs periodic stewardship.  
**Effects:** Background jobs propose/write inferred relations.

---

### Memory evolution (version control)

**What it does:** Immutable version chain per memory with restore and merge.

| Key variables | `MEMORY_EVOLUTION_ENABLED`, `MEMORY_EVOLUTION_STORE_PROVIDER` |

**Benefits:** Safe edits; rollback bad agent writes.  
**Before enabling:** Storage multiplier; API complexity.  
**Effects:** REST version endpoints active; each update creates version row.

---

### Multi-client sync

**What it does:** Pull/push memory deltas across clients with conflict resolution.

| Key variables | `MULTI_CLIENT_SYNC_ENABLED`, `MULTI_CLIENT_SYNC_STORE_PROVIDER`, `MULTI_CLIENT_SYNC_STRATEGY` (default `lww`) |

**Benefits:** Same brain across devices/offline clients.  
**Before enabling:** Conflict edge cases; requires sync-aware clients.  
**Effects:** MCP `sync_pull`, `sync_push`, `sync_status` persist sync state.

---

### Memory stewardship

**What it does:** Deterministic maintenance pipeline (dedupe hints, stale cleanup, compression triggers).

| Key variables | `MEMORY_STEWARDSHIP_ENABLED`, `MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER`, `MEMORY_STEWARDSHIP_SCHEDULER` |

**Benefits:** Hands-off hygiene for long-running brains.  
**Before enabling:** Run `npm run compress:memories` dry-run and review stewardship rules in staging before scheduling.  
**Effects:** MCP `run_stewardship`; scheduled runs when scheduler set.

---

## Tier 4 — Transport & protocols

### gRPC

**What it does:** Binary RPC transport sharing handlers with REST/MCP.

| Key variables | `GRPC_ENABLED`, `GRPC_PORT`, `GRPC_HOST`, `GRPC_TLS_*` |

**Benefits:** Efficient streaming for internal callers.  
**Before enabling:** Requires long-running host (not Vercel serverless); TLS ops burden.  
**Effects:** gRPC server binds alongside REST when enabled.

---

### SSE context streaming

**What it does:** Server-sent events stream for progressive context delivery.

| Key variables | `SSE_ENABLED`, `SSE_MAX_CONCURRENT_PER_IP`, rate limit vars |

**Benefits:** Lower time-to-first-token for large context builds.  
**Before enabling:** Long-lived connections; not serverless-friendly.  
**Effects:** `GET /api/v1/context/stream` available. Endpoint: [GUIDE — Optional commands](GUIDE.md#7-optional-commands).

---

### WebSocket

**What it does:** Bidirectional WebSocket transport for real-time clients.

| Key variables | `WEBSOCKET_ENABLED`, `WEBSOCKET_PATH` |

**Benefits:** Interactive UIs and live updates.  
**Before enabling:** Connection management complexity.  
**Effects:** WebSocket route mounted at configured path.

---

### Remote MCP (ChatGPT / web)

**What it does:** HTTPS MCP endpoint at `/mcp` for clients that cannot run stdio.

| Key variables | `REMOTE_MCP_ENABLED`, `REMOTE_MCP_PATH`, `REMOTE_MCP_PUBLIC_URL`, `REMOTE_MCP_CORS_ORIGINS`, `REMOTE_MCP_OAUTH_ENABLED`, `REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED` |

**Benefits:** ChatGPT New App, web MCP hosts connect without local install.  
**Before enabling:** Deploy on a **persistent host** (Railway/VPS/Fly single instance). In production set `REMOTE_MCP_PERSISTENT_HOST_ACKNOWLEDGED=true` after confirming host layout — server refuses to start otherwise.  
**Built-in mitigation:** In-memory session store; capabilities manifest exposes `requiresPersistentHost: true`.  
**Effects:** MCP protocol served over HTTP; OAuth discovery when OAuth enabled. See [GUIDE — ChatGPT](GUIDE.md#61-chatgpt).

---

### OpenTelemetry traces

**What it does:** Exports distributed traces to an OTLP collector.

| Key variables | `OTEL_ENABLED`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT` |

**Benefits:** Debug latency across retrieval pipeline.  
**Before enabling:** Collector infrastructure required.  
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

**Benefits:** Enterprise authz (OPA/Rego), SSO, quota enforcement.  
**Before enabling:** OPA reachable, IdP configured, and policies tested in staging; set quotas from measured traffic.  
**Built-in mitigation:** OPA HTTP errors and network failures **fail closed** (`allowed: false`, reason `OPA unreachable`). IdP userinfo failures return 401.  
**Effects:** API requests evaluated against policy engine; SSO replaces bootstrap-only auth when enabled; quotas return 429 when exceeded.

**Authorization samples:** [policies/](policies/) — load Rego into OPA, not Ratary directly. See [policies/README.md](policies/README.md).

---

## Tier 6 — Federation, cloud, observability, platforms

### Federation

**What it does:** Cross-node knowledge exchange between Ratary instances.

| Key variables | `FEDERATION_ENABLED`, `FEDERATION_NODE_ID`, `FEDERATION_PEERS_JSON`, `FEDERATION_TRUST_PROVIDER`, `FEDERATION_TRUST_FILE_PATH`, policy providers |

**Benefits:** Multi-region or multi-tenant brain mesh.  
**Before enabling:** Mark peers `"trusted": true` in `FEDERATION_PEERS_JSON` or use `FEDERATION_TRUST_PROVIDER=file` with an allowlist file. Validate sync in a staging node pair first.  
**Built-in mitigation:** Production auto-uses **registry strict trust** (only `trusted: true` peers) even when `FEDERATION_TRUST_PROVIDER=noop`. Development keeps permissive noop trust.  
**Effects:** Federation APIs and peer transport active; untrusted peers rejected at trust verification.

---

### Cloud control plane & metering

**What it does:** Control-plane metadata, usage metering, DR hooks.

| Key variables | `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED`, `CLOUD_*` |

**Benefits:** Hosted-style ops on self-managed infra.  
**Before enabling:** Mostly relevant for platform operators.  
**Effects:** Usage records persisted; cost gauges available with observability flags.

---

### Observability platform

**What it does:** Prometheus metrics, log shipping, Grafana dashboards, cost estimates.

| Key variables | `OBSERVABILITY_PLATFORM`, `OBS_METRICS_PATH`, `OBS_LOG_SHIPPER`, `OBS_LOKI_PUSH_URL`, `OBS_COST_METRICS_ENABLED`, `COST_*` |

**Benefits:** Production visibility; SLO dashboards in `observability/`.  
**Before enabling:** External Prometheus/Grafana/Loki stack.  
**Effects:** `/metrics` exposed; dashboards importable. See [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) and [GUIDE — Observability](GUIDE.md#10-observability).

---

### Plugin marketplace

**What it does:** Load and verify plugins from local catalog.

| Key variables | `PLUGIN_MARKETPLACE_ENABLED`, `PLUGIN_SIGNATURE_REQUIRED`, `PLUGIN_TRUSTED_PUBLIC_KEYS`, `PLUGIN_MARKETPLACE_SOURCE` |

**Benefits:** Extend Ratary without forking core.  
**Before enabling:** Load `PLUGIN_TRUSTED_PUBLIC_KEYS`; keep `PLUGIN_SIGNATURE_REQUIRED=true` in production.  
**Effects:** Plugin enable/install APIs gated by marketplace + policy engine.

Catalog: [../infrastructure/marketplace/catalog.json](../infrastructure/marketplace/catalog.json).

---

### Search & graph production ops

**What it does:** Operational sync jobs for Meilisearch/Neo4j at scale.

| Key variables | `SEARCH_GRAPH_PLATFORM_ENABLED`, `GRAPH_VECTOR_SEEDS_ENABLED` |

**Benefits:** Keeps external indexes consistent under load.  
**Before enabling:** Background job monitoring required.  
**Effects:** Scheduled sync workers run when platform flag enabled.

---

### Content & vector scale

**What it does:** Automated offload to R2/pgvector with ops tooling.

| Key variables | `CONTENT_SCALE_PLATFORM_ENABLED`, `CONTENT_OFFLOAD_MIN_BYTES`, `CONTENT_OFFLOAD_CLEAR_INLINE` |

**Benefits:** Hands-off large-body migration.  
**Before enabling:** Confirm object storage bucket and lifecycle rules before `CONTENT_OFFLOAD_CLEAR_INLINE=true`.  
**Built-in mitigation:** Offload verifies object **read-back matches** source body before updating SQL; mismatch aborts row and skips inline clear. Default `CONTENT_OFFLOAD_CLEAR_INLINE=false`.  
**Effects:** Bodies migrated per threshold rules; inline cleared only after verified object storage write.

---

### Knowledge fabric (connectors)

**What it does:** Ingest from external systems (Notion live, GitHub, catalog JSON). Phase 29 adds **live Notion sync**, webhook ingress, and job tracking on top of Phase 23 MVP.

| Key variables | See table below |

| Variable | Default | Purpose |
|----------|---------|---------|
| `KNOWLEDGE_FABRIC_ENABLED` | `false` | Master switch for fabric routes and ingest |
| `KNOWLEDGE_FABRIC_CATALOG_JSON` | — | Static connector catalog override (optional) |
| `CONNECTOR_SYNC_ENABLED` | `false` | Live sync jobs + REST `/knowledge-fabric/sync/*` |
| `CONNECTOR_WEBHOOK_SECRET` | — | HMAC secret for `POST /knowledge-fabric/webhooks/:connectorId` |
| `CONNECTOR_SYNC_INTERVAL_MS` | `0` | Background poll interval (`0` = manual/REST only) |
| `NOTION_API_TOKEN` | — | Notion integration token (`ntn_...`) |
| `NOTION_API_VERSION` | `2022-06-28` | Notion API version header |
| `CONFLUENCE_BASE_URL` | — | Confluence Cloud site (`https://your-domain.atlassian.net`) |
| `CONFLUENCE_EMAIL` | — | Atlassian account email (Basic auth with API token) |
| `CONFLUENCE_API_TOKEN` | — | Confluence API token |
| `GITHUB_TOKEN` | — | GitHub connector (catalog / future live) |

**REST (when enabled):**

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/knowledge-fabric/sync/:connectorId` | Start sync (`incremental` / `full`, optional `dryRun`) |
| `GET` | `/knowledge-fabric/sync/jobs/:jobId` | Poll job status |
| `POST` | `/knowledge-fabric/webhooks/:connectorId` | Signed webhook trigger |

**Client surfaces:** `@ratary/sdk` `client.admin.knowledgeFabric.*` · `@ratary/cli` `ratary connectors sync notion` · smoke script `scripts/test-notion-sync.ts`.

**Benefits:** Unified brain from existing tools of record; provenance tags (`fabric:notion`, `live: true`).  
**Before enabling:** Restrict integration token scope; plan ingest volume; set webhook secret if exposing public URL.  
**Effects:** Connector jobs write or update memories; Postgres/Supabase workspace scoping uses `workspaceScopeSql()` (not SQLite `IS ?` syntax).

Setup walkthrough: [GUIDE.md — Knowledge fabric](GUIDE.md#11-knowledge-fabric-live-connectors).

---

### Ratary platform umbrella

**What it does:** Edition flags and outbound webhooks for platform integrations.

| Key variables | `RATARY_PLATFORM_ENABLED`, `RATARY_PLATFORM_EDITION`, `PLATFORM_WEBHOOKS_ENABLED` |

**Benefits:** SKU differentiation; event-driven integrations.  
**Before enabling:** Webhook delivery monitoring needed.  
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

**Benefits:** Same brain from any machine without local SQL creds in IDE config (hosted REST path).  
**Before enabling:** Requires deployed server and API key rotation discipline.  
**Effects:** npm MCP proxy exposes 6 tools vs 28 for local stdio.

Example: [examples/mcp/remote-api.mcp.json.example](examples/mcp/remote-api.mcp.json.example).

---

## Developer / backup scripts

**What it does:** Watch a local folder and sync chat exports into your configured SQL metadata store.

| Variable | Purpose |
|----------|---------|
| `BACKUP_ROOT` | Folder watched by `npm run sync:backups:watch` |
| `BACKUP_SYNC_DEBOUNCE_MS` | Debounce for file watcher |
| `BACKUP_SYNC_POLL_MS` | Poll interval |

**Benefits:** Recover IDE chat logs into durable memory.  
**Before enabling:** One-way sync — not a backup restore tool for full DB.  
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
