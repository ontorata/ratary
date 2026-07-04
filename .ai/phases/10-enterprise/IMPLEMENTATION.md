# Phase 10 — Infrastructure Adapters — IMPLEMENTATION

**Document:** IMPLEMENTATION  
**Phase status:** Closed  
**Gate:** PASS 2026-07-03  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR-008:** [Platform ports](../../../docs/adr/008-platform-architecture.md)

---

## Purpose

Record the **incremental infrastructure adapter plan**: folder layout, migration strategy, commit sequence, testing gates, and provider priority — **without changing application or domain layers**.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Implementation planning starts |
| **Updated by** | Implementing AI assistant; maintainer on handoff |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | Phase 10 row in [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) |

---

## Completed milestones (2026-07-03)

| Milestone | Status | Evidence |
|-----------|--------|----------|
| **T0** Contract harness + graph move | ✅ | `tests/infrastructure/contracts/isql-database.contract.ts`, `src/infrastructure/graph/d1/` |
| **T1** PostgreSQL adapter | ✅ | [ADR-009 Approved](../../../docs/adr/009-postgresql-metadata-adapter.md), `PostgresSqlDatabaseAdapter` |
| **T2** R2 object storage | ✅ | [ADR-005 Approved](../../../docs/adr/005-content-object-store.md), `R2ObjectStorageAdapter` |
| **T3** pgvector | ✅ | [ADR-011 Approved](../../../docs/adr/011-pgvector-store-adapter.md), `PgVectorStoreAdapter` |
| **T4–T8 + events** | ✅ | ADR-012–016, Redis/S3/DuckDB/Meilisearch/Neo4j/Redis Streams |
| **10A/10B** Reference + tenancy | ✅ | [COMPLETION.md](COMPLETION.md) |

---

## Constraints (immutable)

| Rule | Enforcement |
|------|-------------|
| Application layer unchanged | No edits to `MemoryService`, controllers, MCP tool handlers |
| Domain layer unchanged | No edits to ranking, knowledge rules, retriever merge logic |
| Business logic unchanged | New behavior only via composition wiring + env flags |
| Vendor SDKs in infrastructure only | Grep/lint gate: no `pg`, `ioredis`, `neo4j-driver`, etc. in `services/` or domain |
| One reference adapter per port family per sub-ADR | See [Provider priority](#provider-priority-tiers) |
| Default env = pre-Phase-10 behavior | Full regression suite green at defaults |

---

## Current baseline

### Ports (Phase 9.5 ✅)

`src/ports/` — `ISqlDatabase`, `IMemoryRepository`, `IRelationRepository`, `IEmbeddingProvider`, `IVectorStore`, `IGraphStore`, `IObjectStorage`, `ICache`, `IEventBus`, `IAnalyticsStore`, enterprise ports.

### Reference infrastructure (partial ✅)

```
src/infrastructure/
├── composition/create-platform-adapters.ts
├── sql/d1-sql-database.adapter.ts
├── vector/d1-vector-store.bridge.ts
├── storage/inline-object-storage.adapter.ts
├── cache/{memory-cache,noop-cache}.adapter.ts
├── events/noop-event-bus.adapter.ts
├── analytics/noop-analytics-store.adapter.ts
└── enterprise/…
```

Wired from `server.ts` and `mcp/server.ts`. Repositories depend on `ISqlDatabase`.

### Not implemented (external providers)

PostgreSQL, MariaDB, MySQL, SQLite, R2, MinIO, S3, Redis, Valkey, pgvector, Qdrant, Pinecone, Neo4j, Memgraph, ClickHouse, Snowflake, DuckDB, Redis Streams, Cloudflare Queue, RabbitMQ, Kafka, Meilisearch, OpenSearch, OpenTelemetry, Prometheus.

---

## Architecture (target)

```
Transport (REST / MCP)
        ↓
Application (controllers, services, mcp)     ← UNCHANGED
        ↓
Domain (memory, knowledge, search, retriever) ← UNCHANGED
        ↓
Ports (src/ports/)                         ← UNCHANGED contracts
        ↓
Infrastructure (src/infrastructure/)       ← EXTEND ONLY
        ↓
Vendor engines (D1, Postgres, Redis, …)
```

**Search (Meilisearch / OpenSearch):** implement domain port `IRetrievalCandidateSource` (ADR-001) in `infrastructure/search/`; wire only in `createContextService` — **do not modify** `SearchService`.

**Observability (OTel / Prometheus):** Fastify plugins in `infrastructure/observability/`; wire only from `server.ts` — **no domain port required**.

---

## Folder structure (target)

```
src/infrastructure/
├── composition/
│   ├── create-platform-adapters.ts       # sole platform factory
│   ├── adapter-registry.ts               # env → constructor (optional split)
│   └── create-retrieval-sources.ts       # search/vector/graph candidate wiring
│
├── sql/
│   ├── d1/                               # ✅ exists (flatten to folder in T0)
│   ├── postgres/                          # ADR-009
│   ├── mysql/                             # MariaDB + MySQL (mysql2, dialect flag)
│   └── sqlite/                            # local / embedded dev
│
├── storage/
│   ├── inline/                            # ✅
│   ├── r2/                                # ADR-005
│   └── s3/                                # S3 + MinIO (S3-compatible client)
│
├── cache/
│   ├── noop/                              # ✅
│   ├── memory/                            # ✅
│   └── redis/                             # Redis + Valkey — ADR-012
│
├── vector/
│   ├── d1-bridge/                         # ✅
│   ├── inmemory/                          # test / dev
│   ├── pgvector/                          # ADR-011
│   ├── qdrant/
│   └── pinecone/
│
├── graph/
│   ├── d1/                                # migrate from src/graph/d1-graph.adapter.ts
│   ├── neo4j/                             # ADR-015
│   └── memgraph/
│
├── search/                                # IRetrievalCandidateSource adapters
│   ├── sql/                               # wraps SqlRetrievalCandidateSource
│   ├── meilisearch/                       # ADR-014
│   └── opensearch/
│
├── events/
│   ├── noop/                              # ✅
│   ├── redis-streams/                     # ADR-016
│   ├── cloudflare-queue/
│   ├── rabbitmq/
│   └── kafka/
│
├── analytics/
│   ├── noop/                              # ✅
│   ├── duckdb/                            # ADR-013 (dev reference)
│   ├── clickhouse/
│   └── snowflake/
│
├── observability/                         # transport-only
│   ├── opentelemetry/
│   └── prometheus/
│
├── enterprise/                            # ✅ tenancy
│
└── _shared/                               # internal helpers (not exported)
    ├── connection-pools/
    └── retry-policies.ts

tests/infrastructure/
├── contracts/                             # shared port contract runners
│   ├── isql-database.contract.ts
│   ├── ivector-store.contract.ts
│   ├── icache.contract.ts
│   └── …
├── sql/
├── vector/
└── integration/                           # testcontainers (optional CI job)
```

---

## Port ↔ provider matrix

| Port | Providers | ADR gate | Env flag |
|------|-----------|----------|----------|
| `ISqlDatabase` | D1 ✅, PostgreSQL, MySQL, MariaDB, SQLite | ADR-009 (Postgres) | `SQL_PROVIDER` |
| `IObjectStorage` | inline ✅, R2, S3, MinIO | ADR-005 | `OBJECT_STORAGE_PROVIDER` |
| `ICache` | noop ✅, memory ✅, Redis, Valkey | ADR-012 | `CACHE_PROVIDER` |
| `IVectorStore` | D1 bridge ✅, InMemory, pgvector, Qdrant, Pinecone | ADR-011 | `VECTOR_PROVIDER` |
| `IGraphStore` | D1, Neo4j, Memgraph | ADR-015 | `GRAPH_PROVIDER` |
| `IEventBus` | noop ✅, Redis Streams, CF Queue, RabbitMQ, Kafka | ADR-016 | `EVENT_BUS_PROVIDER` |
| `IAnalyticsStore` | noop ✅, DuckDB, ClickHouse, Snowflake | ADR-013 | `ANALYTICS_PROVIDER` |
| Search | SQL (default), Meilisearch, OpenSearch | ADR-014 | `SEARCH_PROVIDER` |
| Observability | OpenTelemetry, Prometheus | TBD | `OTEL_ENABLED` |

**Env rule:** extend Zod enum only when adapter + ADR are merged. Unimplemented selection → **throw at factory**, not silent fallback.

---

## Provider priority tiers

| Tier | Deliverable | ADR | Rationale |
|------|-------------|-----|-----------|
| **T0** | Contract harness + D1 hardening + graph adapter move to infra | ADR-008 ✅ | Baseline, zero behavior change |
| **T1** | PostgreSQL `ISqlDatabase` | ADR-009 | Largest metadata scale unlock |
| **T2** | R2 `IObjectStorage` | ✅ Implemented | ADR-005 |
| **T3** | pgvector `IVectorStore` | ✅ Implemented | ADR-011 |
| **T4** | Redis `ICache` | ✅ Implemented | ADR-012 |
| **T5** | S3-compatible (MinIO + AWS) | ✅ Implemented | ADR-005 |
| **T6** | DuckDB `IAnalyticsStore` | ✅ Implemented | ADR-013 |
| **T7** | Meilisearch retrieval source | ✅ Implemented | ADR-014 |
| **T8** | Neo4j `IGraphStore` | ✅ Implemented | ADR-015 |
| **T9+** | Redis Streams event bus | ✅ Implemented | ADR-016 |

---

## Migration strategy

### Principles

1. **Zero downtime** — feature flags default to current D1-only path.
2. **Backward compatibility** — solo `owner_id` + default workspace unchanged.
3. **Strangler pattern** — new adapters opt-in per environment.
4. **Sub-ADR gate** — no vendor code before ADR **Approved**.

### Rollout phases

| Step | Action | Production impact |
|------|--------|-------------------|
| 10A | Reference stack + `createPlatformAdapters()` | None at defaults |
| 10B | Enterprise tenancy + RBAC opt-in | None when `ENTERPRISE_RBAC=false` |
| 10C | Postgres adapter + parity tests | None until flag flip |
| 10D | R2 + dual-write content | None until read path switched |
| 10E | Redis cache | None until consumers use cache |
| 10F | pgvector | None until `VECTOR_PROVIDER` changed |
| 10G | Graph infra move + Neo4j | None until `GRAPH_PROVIDER` changed |
| 10H–K | Analytics, events, search, OTel | Opt-in per flag |

### Example cutover (Postgres metadata)

```
1. Deploy adapter; SQL_PROVIDER=d1
2. Backfill D1 → Postgres; read fallback D1
3. SQL_PROVIDER=postgres; dual-write
4. Retire D1 writes
```

Rollback: revert env flags to defaults.

---

## Commit plan

| # | Theme | Scope |
|---|-------|-------|
| C1 | `infra: add contract test harness` | `tests/infrastructure/contracts/*` |
| C2 | `infra(sql): harden D1 adapter + contracts` | `sql/d1`, tests |
| C3 | `infra(composition): extract adapter registry` | `composition/*` |
| C4 | `infra(graph): move D1GraphAdapter to infrastructure` | move + re-export shim |
| C5 | `infra(sql): PostgresSqlDatabaseAdapter` | ADR-009 Approved |
| C6 | `infra(storage): R2ObjectStorageAdapter` | ADR-005 Approved |
| C7 | `infra(vector): PgVectorStoreAdapter` | ADR-011 Approved |
| C8 | `infra(cache): RedisCacheAdapter` | ADR-012 Approved |
| C9 | `infra(search): MeilisearchRetrievalSource` | ADR-014 Approved |
| C10 | `infra(analytics): DuckDBAnalyticsStore` | ADR-013 Approved |
| C11 | `infra(events): RedisStreamsEventBus` | ADR-016 Approved |
| C12 | `infra(obs): OpenTelemetry fastify plugin` | ✅ Implemented |
| C13+ | One commit per additional vendor | isolated adapter + tests |

**Rule:** one concern per commit; no mixing adapter + domain + gate docs in one commit.

---

## Testing plan

### Tiers

| Tier | Purpose | Required |
|------|---------|----------|
| **Contract** | Every adapter passes shared port harness | Every adapter PR |
| **Unit** | Mock vendor SDK boundary | Every adapter PR |
| **Integration** | Testcontainers / emulator | T1+ adapters; optional CI job |

### Contract harness (to add)

```
tests/infrastructure/contracts/
  runSqlDatabaseContract(factory)
  runVectorStoreContract(factory)
  runCacheContract(factory)
  runObjectStorageContract(factory)
  …
```

Extend patterns from `tests/ports/platform-ports.test.ts` and `tests/graph/igraph-provider.interface.test.ts`.

### Regression gates (always)

| Gate | Target |
|------|--------|
| `npm run lint && npm run typecheck && npm test` | PASS |
| Default env full suite | ≥337 tests |
| `cross-owner-leak` | 23 PASS |
| `cross-workspace-leak` | 17 PASS |
| `cross-organization-leak` | 12 PASS (RBAC on) |
| Vendor import grep | Zero in `services/`, domain cores |

### Integration emulators (optional CI)

| Adapter | Emulator |
|---------|----------|
| Postgres + pgvector | Testcontainers |
| MinIO | Testcontainers |
| Redis / Valkey | Testcontainers |
| Meilisearch | Testcontainers |
| Neo4j | Testcontainers |

---

## Per-adapter checklist

- [ ] Implements exactly one port (or `IRetrievalCandidateSource` for search)
- [ ] No imports from application or domain layers
- [ ] Passes contract tests
- [ ] Wired only in composition root / context factory
- [ ] Env flag documented; throws if misconfigured
- [ ] Default env regression green
- [ ] Sub-ADR **Approved** before merge

---

## Risk assessment

| ID | Risk | L | I | Mitigation |
|----|------|---|---|------------|
| R-01 | Scope creep — all providers at once | H | H | Tier table; DESIGN exclusion list |
| R-02 | Vendor leak into services | M | C | Lint boundary + grep CI |
| R-03 | SQL dialect drift | H | H | Separate adapters; parity tests |
| R-04 | Object storage dual-write inconsistency | M | H | ADR-005: inline fallback |
| R-05 | Factory god-object | M | M | Split `adapter-registry.ts` |
| R-06 | Search breaks SearchService | M | H | `IRetrievalCandidateSource` only |
| R-07 | OTel overhead | L | M | Opt-in; default off |
| R-08 | Test flakiness | M | L | Contract mandatory; integration optional |
| R-09 | Env enum ahead of code | M | M | Factory throw, not silent default |
| R-10 | Graph move breaks imports | L | M | Re-export shim one release |

---

## Explicit non-deliverables

- Implementing every provider in the supported list in one phase
- `MemoryServiceV2`, `RetrieverV2`, service rewrites
- Domain imports of infrastructure
- Breaking REST/MCP contracts
- Postgres / R2 / Neo4j / Kafka code before respective ADR **Approved**

---

## Next actions

1. Owner approves sub-ADR priority: **ADR-009 → ADR-005 → ADR-011**.
2. Land **T0**: contract harness + graph adapter relocation (infra-only).
3. Implement **T1** (Postgres) as template for subsequent adapters.

---

## References

- [DESIGN.md](DESIGN.md)
- [MIGRATION.md](MIGRATION.md)
- [TESTING.md](TESTING.md)
- [RISKS.md](RISKS.md)
- [docs/adr/README.md](../../../docs/adr/README.md)

---

*Planning draft 2026-07-03. Application and domain layers remain frozen during adapter rollout.*
