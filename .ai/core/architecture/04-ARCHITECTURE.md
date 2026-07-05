# 04 — Architecture

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Defines system structure; operational phase status lives in [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md).

---

# Purpose

Define the structural architecture of the Ratary memory foundation.

Specify layer boundaries, dependency direction, capability domains, ports, and extension points that remain valid across storage engines, deployment targets, and future capability phases.

Provide AI assistants a single map for placing new code, wiring adapters, and evaluating structural impact before implementation.

---

# Scope

## Covered

- Layer architecture and dependency graph
- Memory, knowledge, search, embedding, MCP, and auth domains
- Future vector, graph, and agent integration boundaries
- Ports-and-adapters model and extension points
- Composition roots and cross-cutting flows

## Not Covered

- Immutable constitutional law → [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md)
- Engineering and coding rules → [01-05-WORKFLOW.md](01-05-WORKFLOW.md), [02-CODING.md](../../core/standards/02-CODING.md)
- Naming conventions → [03-NAMING.md](../../core/standards/03-NAMING.md)
- Canonical module registry (implementation names) → [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md)
- Active phase tasks and deliverables → [../../TASK_PROMPT.md](../../TASK_PROMPT.md)
- ADR content and approval → [../adr/POLICY.md](../../adr/POLICY.md), [adr/](../../adr/)
- User setup and operations → [../PANDUAN.md](../../docs/PANDUAN.md)
- Live deployment inventory and test counts → [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md)

---

# Principles

1. **Foundation only** — This repository owns durable memory, knowledge metadata, retrieval, authorization, and protocol access. Reasoning, planning, and agent execution live outside.

2. **Inward dependencies** — Transport and persistence depend on application and domain abstractions. Domain logic does not depend on frameworks or storage.

3. **One business logic path** — REST and MCP invoke the same application services. Protocol handlers do not duplicate orchestration.

4. **Ports before engines** — Swappable infrastructure (metadata DB, embeddings, vectors, blobs, graph, identity) is accessed through interfaces wired at the composition root.

5. **Separate retrieval paths** — Paginated REST search and bounded LLM context retrieval are distinct pipelines sharing ranking primitives — not one merged code path.

6. **Async enrichment** — Embedding and bulk backfill are offline or job-driven. Synchronous CRUD does not block on inference unless an approved ADR states otherwise.

7. **Owner-scoped isolation** — Every capability layer enforces scope at persistence and use-case boundaries. Scope model may expand per ADR-002 without breaking `ownerId` contract.

8. **Additive extension** — New capability phases extend ports and adapters. Existing public contracts remain stable.

---

# Standards

## Capability stack

The system evolves through ordered capabilities. This repository implements the layers below **Agent**; higher layers integrate at protocol boundaries only.

```
┌─────────────────────────────────────────────────────────────┐
│  Agent / Reasoning / Planning / Execution  (outside repo)   │
└───────────────────────────┬─────────────────────────────────┘
                            │ MCP / REST / gRPC (opt-in)
┌───────────────────────────▼─────────────────────────────────┐
│  Transport layer — src/transport/ (Phase 10.5)              │
│  REST (Fastify) │ MCP (stdio) │ gRPC (GRPC_ENABLED=false)   │
├───────────────────────────┬─────────────────────────────────┤
│  Auth layer               │  Handlers + Controllers (edge)  │
├───────────────────────────┴─────────────────────────────────┤
│  Application services (orchestration) — UNCHANGED             │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Memory   │ Knowledge│ Search   │ Embedding│ (future Graph)  │
│ domain   │ domain   │ domain   │ domain   │                 │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│  Persistence ports + adapters (repositories, stores)        │
├─────────────────────────────────────────────────────────────┤
│  Storage engines (D1 today; Postgres, Vectorize, R2, …)     │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Status | Responsibility |
|-------|--------|----------------|
| Memory | Implemented | CRUD, backup, intelligence pipeline, context, consolidation |
| Knowledge | Implemented | Metadata enrichment, codename, slug, relations |
| Search | Implemented | REST search orchestration, pure ranking engine |
| Auth | Implemented | Identity chain, permissions, audit |
| MCP | Implemented | stdio protocol tools → shared services |
| Embedding | Implemented | Async inference port, vector store port, backfill job |
| Vector retrieval | Planned (Phase 6) | Hybrid candidate source via `IEmbeddingStore.searchSimilar` |
| Graph | Planned (Phase 8) | `IGraphProvider` traversal; flat relations remain |
| Agent runtime | Planned (Phase 7+) | External; consumes MCP/REST only |

## Layer architecture

| Layer | Modules | Responsibility | Forbidden |
|-------|---------|----------------|-----------|
| **Transport — registry** | `transport/registry/` | Wire enabled protocol servers at bootstrap | Business logic |
| **Transport — REST** | `transport/rest/` (legacy: `routes/`, `controllers/`) | HTTP routing, validation, response mapping | Business logic, SQL |
| **Transport — MCP** | `transport/mcp/` (legacy: `mcp/`) | stdio protocol, tool dispatch, scope bootstrap | Duplicated business logic |
| **Transport — gRPC** | `transport/grpc/` (Phase 10.5, opt-in) | Proto services, streaming, interceptors | Business logic, SQL |
| **Transport — shared** | `transport/shared/` | `TransportContext`, shared handlers, scope unify | Domain rules, persistence |
| **Application** | `services/` | Use-case orchestration, scope parameters, port coordination | HTTP types, SQL, vendor SDKs |
| **Domain — memory** | `memory/` | Retrieval, ranking orchestration, context budget, prompt assembly, consolidation | SQL, HTTP |
| **Domain — knowledge** | `knowledge/` | Pure generators + `KnowledgeService` enrichment | SQL, HTTP |
| **Domain — search** | `search/` | `SearchService` + pure `ranking.engine` | Repository imports in engine |
| **Domain — embedding** | `embedding/` | Provider/store ports, job runner, pure similarity | SQL in provider; vector SQL in metadata repo |
| **Persistence** | `repositories/`, `embedding/*Store` | Scoped queries, row mapping | Business rules, ranking |
| **Auth** | `auth/` | Identity providers, JWT, permissions, audit | Business memory logic |
| **Infrastructure** | `db/`, `config/`, `plugins/` | Client, migrations, env, framework plugins | Domain rules |
| **Composition root** | `server.ts`, `mcp/server.ts`, `create-*.ts`, `scripts/` | Wire concrete adapters | Business rules |

## Dependency graph

### Allowed dependency direction

```
routes → controllers → services → domain modules (pure)
                    ↘ repositories / stores (ports)
                    ↘ auth services (middleware invokes)

mcp/server → services → (same as above)

repositories → db client, types, mappers
embedding adapters → db client, provider client (injectable)
domain engines → types, config constants only

composition root → all concrete implementations
```

### Prohibited dependencies

```
repositories  → services | controllers | routes
domain engines → repositories | db | HTTP frameworks
services      → routes | controllers | mcp
knowledge pure generators → services
any inner layer → composition root
```

### REST request flow

```
HTTP Client
  → Fastify (server.ts)           [composition root]
      → auth middleware            [auth layer]
      → routes/                    [edge: validation]
      → controllers/               [edge: mapping]
      → services/ | memory/        [application + domain]
      → repositories/ | stores/    [persistence ports]
      → storage adapter            [D1 / future engines]
```

### MCP request flow

```
AI Client (stdio)
  → mcp/stdio.ts → mcp/server.ts   [edge + composition root]
      → MemoryScope (MCP_OWNER_ID)
      → services/ | memory/        [same application layer as REST]
      → repositories/ | stores/
      → storage adapter
```

MCP does not traverse REST. Both share application services.

---

## Memory layer

**Owns:** durable memory records, backup import/export, LLM-oriented retrieval pipeline, context assembly, access tracking, consolidation.

**Canonical flow — context retrieval (LLM):**

```
ContextService
  → Retriever
      → IRetrievalCandidateSource (SQL today)
  → Ranker
      → ranking.engine (pure) + retrieval weights
  → ContextBuilder (character/token budget)
  → PromptBuilder
  → IMemoryWriter.recordAccess (per ranked item)
```

**Canonical flow — CRUD:**

```
MemoryService
  → KnowledgeService (enrichment on create/update)
  → IMemoryRepository
  → optional IEmbeddingStore cleanup on delete/replace
```

**Rules:**

- `Retriever` is for bounded candidate sets, not paginated UI search.
- `ContextService` owns budget enforcement; config in `context.config.ts`.
- Consolidation runs via script/job — not on every read path.
- `semantic_hash` and intelligence fields are metadata — not reasoning state.
- Semantic compression (Phase 5.5, ADR-023): `memory/compression/` defines `ICompressionPolicy`; `MemoryConsolidator` extended for hierarchical summaries (`level=summary|canonical`), `consolidates` relations, and `compression_meta` audit. Gated by `COMPRESSION_ENABLED=false`. CLI: `compress:memories`.
- Progressive retrieval (Phase 6.5, ADR-024): `memory/retrieval-policy/` defines `IRetrievalPolicy` / `RetrievalPlan`; `ContextService.buildContext` resolves policy after rank, gates body hydration, returns additive `retrievalPlan`. Composition: `create-progressive-retrieval-ports.ts`. Manifest: `supportsProgressiveRetrieval`.
- Stewardship (Phase 04.7, ADR-045): `memory/stewardship/` — seven-task pipeline (metadata, consolidation, graph repair, embedding audit, index repair, ranking refresh, retrieval optimization). Ports: `IMemoryStewardshipOrchestrator`, `IMaintenanceTask`, `IStewardshipRunStore`, `IStewardshipScheduler`. MCP `run_stewardship`. Gated by `MEMORY_STEWARDSHIP_ENABLED`; optional SQL run store and local scheduler.
- Quality signals (Phase 8.5, ADR-026): `ingest/` defines `IMemorySignalIngestor`, `DefaultSignalNormalizer`, `ImportanceScoringPolicy`; optional `POST /api/v1/signals` and `memory_signals` audit store. Gated by `SIGNAL_INGEST_ENABLED=false`. CLI: `reflect:signals` (advisory-only).
- Learning intelligence (Phase 8.6, ADR-057): `learning/` orchestrates async policy snapshots from signal events; `DefaultRankingLearningEngine` produces bounded retrieval weight multipliers; `ContextService` loads active snapshot. Gated by `LEARNING_ENGINE_ENABLED=false`. CLI: `learning:run`.
- Graph relation inference (Phase 8.7, ADR-041): `inference/` orchestrates batch inferred edges into `memory_relations` (`source_type=inferred`); manual edges never overwritten. Gated by `RELATION_INFERENCE_ENABLED=false`. CLI: `infer:relations`.
- Inspection pattern ledger (Phase 8.8, ADR-059): `learning/inspection/` mines `inspection_outcome` signals into side-store patterns + optional recall memories; Forge/MCP recall. Gated by `INSPECTION_LEDGER_ENABLED=false`. CLI: `inspection:mine`.
- Memory evolution (Phase 09.7, ADR-040): `evolution/` archives pre-update snapshots to `memory_versions`; `memories` remains Current head. Gated by `MEMORY_EVOLUTION_ENABLED=false`. CLI: `evolution:history`.
- Multi-client sync (Phase 09.8, ADR-042): `client-sync/` pull/push with conflict resolution; extends `ISyncManager`. Gated by `MULTI_CLIENT_SYNC_ENABLED=false`. CLI: `sync:status`.
- Event pipeline (Phase 12, ADR-020): `events/` domain publishers + consumer registry; post-commit fan-out via `IEventBus`. Gated by `EVENT_CONSUMERS_ENABLED=false`. Requires `EVENT_BUS_PROVIDER=redis` when ON.
- Production ops (Phase 11, ADR-018): Postgres schema bootstrap, D1→Postgres backfill/parity scripts, staging harness. Default `SQL_PROVIDER=d1`. CLI: `db:apply-postgres-schema`, `db:backfill-d1-to-postgres`, `db:verify-postgres-parity`.

---

## Knowledge layer

**Owns:** codename, slug, summary, keywords, category, memory type, importance, relation edges (via relation service/repository).

**Structure:**

```
knowledge/
  *.generator.ts     pure functions (codename, slug, summary, keywords)
  KnowledgeService   orchestrates generators on create/update
  metadata.validator validation rules
```

**Rules:**

- Generators are pure — no repository access.
- `KnowledgeService` is invoked from `MemoryService`, not from controllers directly.
- Relations are flat edges (`memory_relations`); graph traversal is a future port.
- Unique constraints per owner: codename, slug.

---

## Search layer

**Owns:** REST search orchestration and pure relevance scoring.

**Flow (separate from Retriever):**

```
SearchService
  → IMemoryReader.findSearchCandidates
  → rankMemories (ranking.engine — pure)
  → paginate
```

**Rules:**

- `RankingEngine` / `ranking.engine.ts` must not import repositories, HTTP, or storage.
- Weights and caps in `ranking.config.ts`.
- Search returns paginated results for human/API browse — not LLM context budget.
- Phase 6 may fuse vector scores in engine or composite ranker — not by merging `SearchService` and `Retriever` into one class.

---

## Embedding layer

**Status:** Implemented (Phase 5). Not synchronous on CRUD.

**Owns:** inference port, vector store port, embed text normalization, content hash, batch job runner.

**Flow:**

```
scripts/backfill-embeddings.ts
  → EmbeddingJobRunner
      → IMemoryReader.findWithoutEmbedding
      → IEmbeddingProvider.embed
      → IEmbeddingStore.upsert
      → IMemoryWriter.applyEmbeddingBackfill
```

**Rules:**

- Vectors live in `memory_embeddings`; `memories.embedding_id` is the link column.
- `IEmbeddingProvider` — vendor inference (noop, OpenAI, future Workers AI).
- `IEmbeddingStore` — persistence and owner-scoped `searchSimilar` (MVP in-process cosine).
- No embedding calls inside `insert()` / `update()`.
- No vector SQL in `MemoryRepository`.
- Delete and replace-backup clean vectors via `MemoryService` + `IEmbeddingStore`.

**Phase 6 handoff:** `VectorRetrievalCandidateSource` implements `IRetrievalCandidateSource` using `IEmbeddingStore.searchSimilar` — Retriever unchanged.

---

## MCP layer

**Owns:** stdio transport, tool schema definitions, scope resolution, delegation to application services.

**Rules:**

- Tools map to service methods — no SQL in tool handlers.
- Scope: `MCP_OWNER_ID` env → `MemoryScope` (required in production).
- Tool count and schemas are public contracts — additive changes only.
- MCP auth model: D1 credentials in env, not REST JWT chain.
- Same `MemoryService`, `ContextService`, `SearchService` as REST.

**Composition:** `startMcpStdioServer()` in `mcp/server.ts` is a composition root alongside `server.ts`. Phase 10.5 consolidates under `transport/mcp/` without behavior change.

---

## Transport layer (Phase 10.5 — implemented)

**Status:** Implemented — [ADR-027](../../adr/027-transport-connectivity-layer.md) Implemented (2026-07-04) · [10.5 DESIGN](../../phases/10.5-transport-connectivity/DESIGN.md)

**Owns:** protocol adapters (REST, MCP stdio, optional gRPC), `TransportContext`, shared application handlers, transport registry, manifest transport section.

**Structure:**

```
transport/
  shared/     TransportContext, IApplicationHandler, handlers (thin), scope unify, errors
  rest/       rest-server.ts (buildApp) + RestTransportServer   ← src/server.ts re-exports
  mcp/        mcp-server.ts (stdio) + McpTransportServer         ← src/mcp/server.ts re-exports
  grpc/       ontorata.ratary.v1 proto + GrpcTransportServer (GRPC_ENABLED=false default)
  registry/   ITransportServer, TransportRegistry, startTransports()
```

**Composition:** `startTransports()` builds a `TransportRegistry`, always registers `RestTransportServer`, and registers `GrpcTransportServer` only when `GRPC_ENABLED=true` (dynamic import keeps `@grpc/grpc-js` off the default path). Legacy import paths `src/server.ts` and `src/mcp/server.ts` are preserved as strangler re-export shims.

**Rules:**

- All transports delegate to the **same** shared handlers → **same** application services.
- MCP does not traverse REST (preserved).
- `services/` MUST NOT import Fastify, MCP SDK, or gRPC libraries.
- REST remains **public API** (`/api/v1`). MCP remains **AI protocol** (stdio). gRPC is **internal/enterprise opt-in**.
- SDK (`@ratary/client`) lives **outside** repo — repo publishes OpenAPI + proto only.
- GraphQL deferred — separate ADR required.

**Protocol roles:**

| Protocol | Primary audience | Default |
|----------|------------------|---------|
| REST | Public integrators, ChatGPT Actions | ✅ always |
| MCP stdio | IDE-embedded AI clients | ✅ always |
| gRPC | Batch ingest, streaming context, service mesh | ❌ opt-in |

---

## Production operations (Phase 11 — implemented)

**Status:** Implemented — [ADR-018](../../adr/018-production-postgres-cutover.md) Approved (2026-07-03) · Gate PASS (2026-07-04) · [11 DESIGN](../../phases/11-production-ops/DESIGN.md)

**Owns:** Postgres metadata cutover **operational proof** — schema bootstrap, D1→Postgres backfill, parity verification, staging harness. **Does not** rewrite application services.

**Structure:**

```
src/db/postgres-migrations.ts       runPostgresMigrations(ISqlDatabase)
scripts/
  apply-postgres-schema.ts          npm run db:apply-postgres-schema
  backfill-d1-to-postgres.ts        npm run db:backfill-d1-to-postgres
  verify-postgres-parity.ts         npm run db:verify-postgres-parity
  lib/d1-to-postgres-backfill.ts    FK-safe table order, batch upsert
  lib/postgres-parity.ts            count-based parity check
.github/workflows/postgres-staging.yml
tests/db/postgres-staging.integration.test.ts
```

**Gating:** `SQL_PROVIDER=d1` default unchanged. Postgres opt-in: `SQL_PROVIDER=postgres` + `DATABASE_URL`. Cutover runbook: [MIGRATION.md](../../phases/11-production-ops/MIGRATION.md).

---

## Runtime compatibility (Phase 7.5 — implemented)

**Status:** Implemented — [ADR-025](../../adr/025-capability-discovery-api.md) Accepted (2026-07-04) · [07.5 DESIGN](../../phases/07.5-runtime-compatibility/DESIGN.md)

**Owns:** deployment-accurate capability manifest — feature flags, limits, error/rate-limit catalogs, MCP tool registry, protocol version. **Does not** implement agent runtime.

**Structure:**

```
capabilities/
  capability-manifest-builder.ts   env → AICapabilityManifest
  mcp-tool-names.ts                MCP tool registry SSOT
composition/
  create-runtime-compatibility-ports.ts
routes/v1/capabilities.routes.ts   GET /api/v1/capabilities (public)
transport/shared/handlers/capabilities.handlers.ts
```

**Discovery:** REST `GET /api/v1/capabilities` and MCP `get_capabilities` share one builder path. Response includes `X-Protocol-Version` header. Manifest reflects extension flags (5.5 compression, 6.5 retrieval, 04.7 stewardship, 8.5 quality signals, 10.5 transport).

---

## Quality signals (Phase 8.5 — implemented)

**Status:** Implemented — [ADR-026](../../adr/026-memory-quality-signals.md) Accepted (2026-07-04) · [08.5 DESIGN](../../phases/08.5-observation-reflection-learning/DESIGN.md)

**Owns:** scoped signal ingest, deterministic importance scoring, optional append-only audit store. **Does not** implement agent reflection, LLM introspection, or autonomous memory mutation.

**Structure:**

```
ingest/
  memory-signal-ingestor.ts        IMemorySignalIngestor implementation
  default-signal-normalizer.ts     auth + payload validation
  importance-scoring-policy.ts     bounded pure deltas
infrastructure/signals/
  sql-memory-signal-store.ts       append-only memory_signals
composition/
  create-signal-ingest-ports.ts
routes/v1/signals.routes.ts        POST /api/v1/signals (gated)
scripts/reflect-signals.ts         advisory batch (dry-run default)
```

**Gating:** `SIGNAL_INGEST_ENABLED=false` (default). Manifest `supportsQualitySignals` mirrors flag. Explicit feedback applies bounded importance delta; ranker unchanged when disabled.

---

## Learning intelligence (Phase 8.6 — implemented W1 + L26)

**Status:** Implemented — [ADR-057](../../adr/057-learning-intelligence-engine.md) Accepted (2026-07-04) · [08.6 DESIGN](../../phases/08.6-learning-intelligence/DESIGN.md)

**Owns:** async policy learning from signals — event store, behavior analytics, ranking policy snapshots. **Does not** mutate memory SSOT, implement agent loops, or run in-repo ML training.

**Structure:**

```
learning/
  learning-orchestrator.ts           ILearningOrchestrator
  default-behavior-analytics-engine.ts
  default-ranking-learning-engine.ts
  learning-event-recorder.ts         hot-path event append
infrastructure/learning/
  sql-learning-event-store.ts
  sql-learning-artifact-store.ts
composition/create-learning-ports.ts
scripts/run-learning.ts              batch orchestrator CLI
```

**Gating:** `LEARNING_ENGINE_ENABLED=false` (default). Requires `LEARNING_STORE_PROVIDER=sql`. Ranker reads active snapshot via `ContextService` when enabled. Remaining L23–L30 engines are no-op stubs.

---

## Graph relation inference (Phase 8.7 — implemented)

**Status:** Implemented — [ADR-041](../../adr/041-automatic-graph-relation-inference.md) Accepted (2026-07-04) · [08.7 DESIGN](../../phases/08.7-graph-relation-inference/DESIGN.md)

**Owns:** batch inference of `memory_relations` edges from deterministic signals (project, tags, temporal). **Does not** use LLM extraction or mutate manual relations.

**Structure:**

```
inference/
  relation-inference-orchestrator.ts
  default-relation-scoring-policy.ts
  sources/project-cooccurrence-source.ts
  sources/shared-tag-source.ts
  sources/temporal-proximity-source.ts
infrastructure/inference/
  sql-relation-evidence-store.ts
composition/create-relation-inference-ports.ts
repositories/memory-relation.repository.ts   # upsertInferred
scripts/infer-relations.ts
```

**Gating:** `RELATION_INFERENCE_ENABLED=false` (default). Manual `source_type` edges are never overwritten.

---

## Inspection pattern ledger (Phase 8.8 — implemented)

**Status:** Implemented — [ADR-059](../../adr/059-inspection-pattern-ledger.md) Accepted (2026-07-05) · [08.8 DESIGN](../../phases/08.8-inspection-pattern-ledger/DESIGN.md)

**Owns:** evidence-based inspection patterns from resolved `inspection_outcome` signals; confidence lifecycle; contradiction audit; optional Charter promotion. **Does not** replace constitutional Forge blockers or run LLM on hot path.

**Structure:**

```
ingest/inspection-outcome-normalizer.ts
learning/inspection/
  inspection-ledger-orchestrator.ts
  default-inspection-pattern-miner.ts
  default-inspection-confidence-policy.ts
  charter-pattern-promoter.ts
infrastructure/learning/sql-inspection-pattern-store.ts
composition/create-inspection-ledger-ports.ts
controllers/inspection-ledger.controller.ts   # GET /inspection-patterns
scripts/run-inspection-miner.ts
```

**Gating:** `INSPECTION_LEDGER_ENABLED=false` (default; requires `LEARNING_ENGINE_ENABLED` + SQL stores). Charter: `INSPECTION_CHARTER_ENABLED` + `FEDERATION_ENABLED`.

---

## Memory evolution (Phase 09.7 — implemented)

**Status:** Implemented — [ADR-040](../../adr/040-memory-evolution-version-control.md) Accepted (2026-07-04) · [09.7 DESIGN](../../phases/09.7-memory-evolution/DESIGN.md)

**Owns:** immutable version chain side-store — pre-update snapshots, head pointer, diff/merge policy ports. **Does not** replace REST v1 or mutate history in place.

**Structure:**

```
evolution/
  memory-evolution-coordinator.ts    hook on MemoryService create/update
  memory-evolution.service.ts        list + diff read API
  default-memory-diff-engine.ts
infrastructure/evolution/
  sql-memory-version-store.ts
  sql-memory-head-store.ts
composition/create-memory-evolution-ports.ts
routes/v1/evolution.routes.ts
```

**Gating:** `MEMORY_EVOLUTION_ENABLED=false` (default). Current content always in `memories`; versions are append-only archives.

---

## Multi-client sync (Phase 09.8 — implemented)

**Status:** Implemented — [ADR-042](../../adr/042-multi-client-memory-sync.md) Accepted (2026-07-04) · [09.8 DESIGN](../../phases/09.8-multi-client-sync/DESIGN.md)

**Owns:** client-to-hub pull/push sync, per-platform cursors, conflict resolution strategies. **Distinct from** Phase 14 federation (node-to-node).

**Structure:**

```
client-sync/
  conflict-aware-sync-manager.ts     replaces accept-only when flag ON
  client-sync.service.ts             pull/push/status
  conflict-resolvers.ts              lww | field_merge | manual_queue
infrastructure/client-sync/
  sql-sync-cursor-store.ts
  sql-sync-conflict-store.ts
composition/create-multi-client-sync-ports.ts
routes/v1/client-sync.routes.ts
```

**Gating:** `MULTI_CLIENT_SYNC_ENABLED=false` (default). Flag off → Phase 9 `AcceptSyncManager` only. CLI: `sync:status`.

---

## Event pipeline (Phase 12 — implemented)

**Status:** Implemented — [ADR-020](../../adr/020-event-consumer-architecture.md) Implemented (2026-07-04) · [12 DESIGN](../../phases/12-event-pipeline/DESIGN.md)

**Owns:** async domain event fan-out on `IEventBus` — consumer registry, post-commit publishers, analytics sink. **Distinct from** Phase 19 observability (operational telemetry).

**Structure:**

```
events/
  domain-event-publisher.ts          fire-and-forget publish via IEventBus
  memory-domain-event-coordinator.ts post-commit hooks (MemoryService)
  event-consumer-registry.ts
  event-consumer-runner.ts
  consumers/memory-access-analytics.consumer.ts
infrastructure/audit/
  event-publishing-memory-access-auditor.ts
composition/create-event-pipeline-ports.ts
```

**Gating:** `EVENT_CONSUMERS_ENABLED=false` (default). When ON: requires `EVENT_BUS_PROVIDER=redis`. Optional analytics fan-out when `ANALYTICS_PROVIDER=duckdb`. Manifest: `supportsEventConsumers`.

---

## Protocol layer (Phase 13 — planned)

**Status:** Design draft — [ADR-028](../../adr/028-protocol-layer.md) Proposed · [13-protocol-layer DESIGN](../../phases/13-protocol-layer/DESIGN.md)  
**Prerequisite:** Phase 10.5 (ADR-027 Implemented)

**Owns:** multi-protocol streaming (SSE, WebSocket, gRPC server-stream), protocol benchmark CLI, `ProtocolContext`, shared `IUseCaseHandler`. Evolves `transport/` → `protocol/` canonical root.

**Target structure:**

```
protocol/
  shared/       ProtocolContext, IUseCaseHandler, IStreamPublisher, IContextStreamSource
  rest/         unary (unchanged) + SSE stream route (SSE_ENABLED=false)
  grpc/         unary + ContextService server-stream
  websocket/    WS envelope → handlers (WEBSOCKET_ENABLED=false)
  sse/          text/event-stream adapter
  mcp/          stdio (from 10.5)
  registry/     DI — single MemoryService graph for all protocols
  benchmark/    npm run benchmark:protocols
```

**Layer law:**

| Layer | Must | Must NOT |
|-------|------|----------|
| Protocol adapter | Wire encode/decode, auth hooks | Business logic, SQL, repository |
| Handler | Call injected services | Import storage SDKs or repositories |
| Service | Orchestrate ports | Import Fastify, gRPC, ws, SSE |
| Repository | Scoped persistence | Know protocol, headers, or wire types |

**Streaming:** `IContextStreamSource` yields chunks from existing `ContextService` output — ranking/budget logic not duplicated in adapters.

**Remote MCP (Phase 13.1):** ChatGPT and web MCP clients connect via HTTPS `/mcp` (Streamable HTTP/SSE) — distinct from stdio; gated by `REMOTE_MCP_ENABLED=false`. Interim: Custom GPT REST Actions ([PANDUAN.md](../../../docs/PANDUAN.md) §6.1).

**Additive API:** `GET /api/v1/context/stream` (SSE). Existing REST v1 unary endpoints unchanged.

---

## Federation layer (Phase 14 — planned)

**Status:** Design draft — [ADR-029](../../adr/029-federation-layer.md) Proposed · [14-federation DESIGN](../../phases/14-federation/DESIGN.md)  
**Prerequisite:** Phase 13 Implemented · Phase 9–10 ✅

**Owns:** cross-node knowledge exchange (workspace, region, organization, cloud) via federation ports. **`MemoryService` unchanged** — `IKnowledgeExchangeService` delegates local persistence to existing MemoryService methods.

**Target structure:**

```
federation/
  ports/       IFederationRegistry, IFederationTransport, IFederationPolicy, IFederationTrustStore, …
  services/    KnowledgeExchangeService → MemoryService (public API only)
  adapters/    registry, transport, trust, policy, metadata — env-selected, no hardcoding
  protocol/    REST /api/v1/federation/* when FEDERATION_ENABLED=true
```

**Layer law:**

| Layer | Must | Must NOT |
|-------|------|----------|
| Federation adapter | Implement ports; vendor SDKs here only | Call repositories directly |
| KnowledgeExchangeService | Orchestrate exchange; call MemoryService | Import cloud-specific logic |
| MemoryService | Local CRUD/search (unchanged) | Import federation modules |
| Repository | Scoped persistence (unchanged) | Know federation peers or regions |

**Default:** `FEDERATION_ENABLED=false`.

---

## Cloud platform layer (Phase 18 — implemented)

**Status:** Implemented (2026-07-04) — [ADR-033](../../adr/033-cloud-platform.md) · [18-cloud-platform IMPLEMENTATION](../../phases/18-cloud-platform/IMPLEMENTATION.md)  
**Prerequisite:** Phase 14 ✅ · Phase 17 ✅

**Owns:** control plane metadata orchestration — workspace provisioning records, region registry, usage metering export, DR orchestration. **`MemoryService` unchanged** — DR calls `exportBackup`; control plane never touches repositories.

```
src/cloud/
  ports/       IControlPlane, IUsageMeter, IDisasterRecovery, IRegionRegistry, …
  services/    ControlPlaneService
  adapters/    noop, manual provisioner, local DR, usage meter
  consumers/   UsageMeterEventConsumer → Phase 12 bus
src/routes/v1/cloud.routes.ts   GET/POST /api/v1/cloud/* when CONTROL_PLANE_ENABLED=true
```

**Default:** `CONTROL_PLANE_ENABLED=false`, `USAGE_METER_ENABLED=false`, `DR_PLATFORM_ENABLED=false`.

---

## Observability platform layer (Phase 19 — implemented)

**Status:** Implemented (2026-07-04) — [ADR-034](../../adr/034-observability-platform.md) · [19-observability-platform IMPLEMENTATION](../../phases/19-observability-platform/IMPLEMENTATION.md)  
**Prerequisite:** Phase 12 ✅ · Phase 13 ✅

**Owns:** metrics/traces/logs export at middleware boundary — Prometheus scrape, OTel trace bridge, Loki log shipper, Grafana dashboard packs, SLO/Alertmanager templates. **`MemoryService` unchanged** — no observability handler on Phase 12 business bus.

```
src/observability/
  ports/       IMetricsExporter, ITraceExporter, ILogShipper, IDashboardPack, ISloRegistry
  middleware/  request duration + counter instrumentation
observability/dashboards/   Grafana JSON (6 packs)
observability/slo/          SLO + Alertmanager templates
GET /metrics                Prometheus scrape when OBSERVABILITY_PLATFORM=true
```

**Default:** `OBSERVABILITY_PLATFORM=false`.

---

## Agent ecosystem layer (Phase 15 — implemented)

**Status:** Implemented (2026-07-04) — [ADR-030](../../adr/030-autonomous-agent-ecosystem.md) · [15-autonomous-agent-ecosystem IMPLEMENTATION](../../phases/15-autonomous-agent-ecosystem/IMPLEMENTATION.md)  
**Prerequisite:** Phase 7/9 ✅ · ADR-025 ✅

**Owns:** external **client catalog** (12 profiles: Cursor, Claude, OpenAI, Gemini, Codex, Continue, Qwen, …), ecosystem manifest, `GET /api/v1/ecosystem/clients`. Enables shared **Memory Cloud** per workspace.

**Forbidden in repo:** agent runtime, planner, executor, autonomous loops, in-repo agent SDK.

**Repository exposes to external agents:** REST · MCP · gRPC (Phase 13) — unchanged role.

```
src/ecosystem/
  catalog/     IAgentClientCatalog — SSOT client profiles (metadata only)
  builders/    AgentEcosystemManifestBuilder
src/routes/v1/ecosystem.routes.ts   GET /api/v1/ecosystem/clients
```

External agent runtimes (outside repo) → protocol → MemoryService.

---

## Enterprise platform layers (Phases 16–20)

**Authority:** [11-ENTERPRISE-ROADMAP.md](../../phases/roadmap/11-ENTERPRISE-ROADMAP.md)

| Phase | Layer | Server `src/` impact | Status |
|-------|-------|---------------------|--------|
| 16 Developer Platform | `packages/` SDK, CLI, MCP — **clients only** | None (OpenAPI additive) | ✅ Implemented — [IMPLEMENTATION](../../phases/16-developer-platform/IMPLEMENTATION.md) |
| 17 Enterprise Security | Auth edge: OPA, SSO, hierarchy, quota | Edge middleware only | ✅ Implemented — [IMPLEMENTATION](../../phases/17-enterprise-security/IMPLEMENTATION.md) |
| 18 Cloud Platform | Control plane ports: provision, meter, DR | Orchestration ports | ✅ Implemented — [IMPLEMENTATION](../../phases/18-cloud-platform/IMPLEMENTATION.md) |
| 19 Observability | Exporters, Grafana packs, SLO | Sidecar adapters | ✅ Implemented — [IMPLEMENTATION](../../phases/19-observability-platform/IMPLEMENTATION.md) |
| 20 AI Infrastructure | Plugin registry, marketplace metadata | Composition root wiring | Planned |

**Capstone (20):** AI Memory **Infrastructure** — not Memory API only. All providers remain ADR-008 ports.

---

## Global AI Intelligence layer (Phase 25 — planned)

**Status:** Design draft — ADR-036/037/038/043 Proposed · [25-global-ai-intelligence DESIGN](../../phases/25-global-ai-intelligence/DESIGN.md)
**Prerequisite:** Phase 12 ✅ · 13 ✅ · 14 · 18 · 19 · 20

**Owns:** distributed-intelligence **composition capstone** — AI telemetry event model, usage analytics engine, cloud-connected ecosystem, and 5-tier federation sync (Workspace → Org → Cloud → Edge → Developer). Composes Phase 14/18/19 ports; **`MemoryService` unchanged** (called as library by the sync orchestrator).

**Target structure:**

```
intelligence/
  telemetry/   ITelemetryRecorder, ITelemetrySink, ITelemetryRedactor — OTLP/Prometheus/Jaeger
  analytics/   IUsageAnalyticsService, IAnalyticsQueryPort — read-only, no SSOT write
  sync/        IGlobalSyncOrchestrator, IOfflineJournal, ISyncConflictPolicy — over Phase 14 exchange
```

**Layer law:**

| Layer | Must | Must NOT |
|-------|------|----------|
| Telemetry adapter | Export via OTel/vendor SDK (adapter only) | Mutate business state; read memory bodies by default |
| Analytics service | Read-only derivations over analytics store | Write `memories`; call `MemoryService.create` |
| Sync orchestrator | Route tiers; delegate to Phase 14 exchange | Access repositories; `switch(cloud)`/`switch(tier)` |

**Default:** `GLOBAL_INTELLIGENCE_PLATFORM=false`. No content collection by default (privacy via `ITelemetryRedactor`).

---

## Auth layer

**Owns:** identity resolution chain, API key and JWT validation, OAuth provider, permission enforcement, audit events, client registry.

**Structure:**

```
auth/
  providers/          IdentityProvider implementations (api-key, jwt, oauth)
  auth.middleware.ts  authenticate hook
  permission.middleware.ts / permissions.ts
  identity.service.ts client.service.ts jwt.service.ts audit.service.ts
  *repository.ts       auth persistence
```

**Rules:**

- REST: `ownerId` derived from authenticated identity on `request.user`.
- Permissions: `memory.read`, `memory.write`; context endpoint requires read.
- Cross-owner access → not-found response at service/repository level.
- Repositories enforce `owner_id` filter; auth layer decides if request may act as that owner.
- Audit scope today: identity and auth events — memory access audit is future ADR.

---

## Future vector layer (Phase 6)

**Not yet implemented.** Requires approved [ADR-001](../../adr/001-multi-source-retrieval.md).

**Planned extension:**

```
IRetrievalCandidateSource
  ├── SqlRetrievalCandidateSource      (existing)
  ├── VectorRetrievalCandidateSource   (new — uses IEmbeddingStore)
  └── CompositeRetrievalCandidateSource (optional — merges ranked lists)
```

**Rules:**

- Hybrid fusion in ranking engine or dedicated fusion module — pure computation.
- REST `/search` and MCP tools unchanged; retrieval quality improves behind same contracts.
- No vector SQL in metadata repository.

---

## Future graph layer (Phase 8)

**Not yet implemented.** Requires `IGraphProvider` per [ADR-002](../../adr/002-workspace-identity-model.md) path.

**Planned extension:**

- `IGraphProvider` — traversal, neighborhood queries, path finding.
- `MemoryRelationRepository` remains for flat edge CRUD — not replaced by V2.
- Graph-augmented retrieval via new `IRetrievalCandidateSource` adapter.
- Workspace/agent/org scope fields additive to `MemoryScope` per ADR-002.

---

## Future agent layer (Phase 7+)

**Outside this repository** — runtime loops, planners, and executors live in Cursor, Claude Code, or custom hosts.

Agents consume MCP tools and REST `/api/v1/*`. **Phase 07.1 Agent Forge** ([DESIGN](../../phases/07.1-agent-forge/DESIGN.md)) defines the **mandatory contributor workflow** for this repo:

| Artifact | Location |
|----------|----------|
| Pipeline stages | `.ai/phases/07.1-agent-forge/PIPELINE.md`, `manifest.json` |
| Cursor skills | `.cursor/skills/forge-*` (13 skills) |
| Mandatory rule | `.cursor/rules/agent-forge.mdc` |
| Design drafts | `.ai/designs/drafts/` |

Recall/Remember bookends use MCP `search_memory` / `save_memory`. No Forge logic in `src/`.

**Rules:**

- No agent loop, task planner, or tool executor logic inside `src/services/` or `src/memory/`.
- No autonomous multi-step reasoning state stored as first-class domain unless approved ADR defines memory-of-record for agent runs.
- Protocol contracts are the stability boundary for agent integration.

---

## Ports and adapters

| Port | Purpose | Adapter(s) today | Swappable to |
|------|---------|------------------|--------------|
| `IMemoryReader` | Scoped reads, search candidates, retrieval projection | `MemoryRepository` | Postgres reader |
| `IMemoryWriter` | Inserts, updates, backfill patches, access recording | `MemoryRepository` | Postgres writer |
| `IMemoryRepository` | Combined reader + writer | same class | same |
| `IRetrievalCandidateSource` | Bounded candidates for Retriever | `SqlRetrievalCandidateSource` | Vector, graph, composite |
| `IEmbeddingProvider` | Text → vector inference | `NoopEmbeddingProvider`, `OpenAIEmbeddingProvider` | Workers AI, local model |
| `IEmbeddingStore` | Vector CRUD, similarity search | `D1EmbeddingStore` | Vectorize, pgvector |
| `IdentityProvider` | Credential verification | API key, JWT, OAuth providers | additional IdPs |
| `IContentStore` | Large blob offload (future) | — | R2, S3, MinIO |
| `IGraphProvider` | Graph traversal (future) | — | D1 CTE, Neo4j, etc. |

**Adapter rules:**

- One metadata repository adapter per engine per process.
- Store adapters (embedding, object, graph) are separate classes — not mixed into metadata repository.
- Adapters implement full port contract including owner scope on every mutating operation.
- Vendor HTTP clients are injectable constructor parameters for testability.

## Extension points

| Extension need | Extension mechanism | Gate |
|----------------|---------------------|------|
| New storage engine | New repository/store adapter + composition root wire | ADR if new port split |
| New inference vendor | New `IEmbeddingProvider` + env config | No ADR if port exists |
| Hybrid retrieval | New `IRetrievalCandidateSource` + rank fusion | ADR-001 |
| Graph-aware retrieval | `IGraphProvider` + candidate source | ADR + Phase 8 |
| Blob storage | `IContentStore` + `object_key` column usage | ADR-005 |
| Workspace scope | Extend `MemoryScope`, additive columns | ADR-002 contract |
| New REST endpoint | Route + controller + service (additive) | No ADR |
| New MCP tool | Tool definition → existing or new service method | Prefer additive |
| Relation port | `IMemoryRelationRepository` extract | ADR before Phase 8 |

**Composition roots (sole wiring location):**

- `src/server.ts` — REST
- `src/mcp/server.ts` — MCP
- `src/services/create-memory-service.ts` — shared memory stack factory
- `scripts/*.ts` — batch jobs and migrations

---

# Required

1. Place new code in the layer and domain defined in this document.
2. Wire new adapters only at composition roots.
3. Extend behavior through ports and additive contracts.
4. Keep REST and MCP on the same application services.
5. Keep `RankingEngine` pure — no I/O.
6. Keep embedding and vector concerns out of metadata repository.
7. Scope all persistence operations by owner identifier.
8. Document new ports in [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md) extension table when merged.
9. Write ADR before implementing graph, hybrid fusion, object store, or layer boundary changes.
10. Preserve separate Search and Retriever pipelines.

---

# Forbidden

1. Business logic in routes, controllers, or MCP tool handler bodies beyond mapping.
2. SQL outside repository and store adapter modules.
3. Duplicate orchestration paths for REST vs MCP.
4. `Retriever` calling `SearchService` or vice versa as a merged pipeline.
5. Synchronous embedding on CRUD hot path.
6. Vector similarity logic in `MemoryRepository`.
7. Agent planning, reasoning loops, or execution state machines inside this repo.
8. `*V2` parallel classes instead of port extension.
9. Graph logic replacing `MemoryRelationRepository` without ADR.
10. Breaking MCP tool schemas or REST response contracts without owner approval.
11. Instantiating concrete adapters inside services or domain modules.
12. Cross-owner data access that reveals resource existence.

---

# Decision Rules

## Where does new code go?

| Question | Layer / module |
|----------|----------------|
| HTTP path or validation hook? | `routes/` |
| JSON shape or status mapping? | `controllers/` |
| Use-case rule or multi-port workflow? | `services/` |
| Pure score/rank/normalize? | `search/ranking.engine` or `memory/` pure module |
| LLM context assembly? | `memory/context.service.ts` pipeline |
| Metadata enrichment? | `knowledge/` |
| Embedding inference? | `embedding/` provider adapter |
| Vector persistence/search? | `embedding/` store adapter |
| SQL query? | `repositories/` or store adapter |
| Protocol tool definition? | `mcp/server.ts` |
| Auth check? | `auth/` middleware or service |
| Wire `new D1*()`? | composition root only |

## Retrieval path selection

| Use case | Pipeline |
|----------|----------|
| User browses/search API with pagination | `SearchService` |
| LLM needs bounded relevant context | `ContextService` → `Retriever` |
| Phase 6 semantic recall | `Retriever` → `VectorRetrievalCandidateSource` |
| Phase 8 relation expansion | `Retriever` → graph candidate source |

## Port vs direct dependency

| Condition | Decision |
|-----------|----------|
| May swap vendor or engine | Port required |
| Pure function, no I/O | No port; domain module |
| Single concrete auth middleware | May use services directly at edge |
| New storage category (blob, graph) | New port family + ADR |

## Phase integration

| Phase | Integrate via |
|-------|----------------|
| 5 Embedding | `IEmbeddingProvider`, `IEmbeddingStore`, backfill job |
| 6 Hybrid | `IRetrievalCandidateSource` + rank fusion |
| 7 Agent runtime | External — MCP/REST only |
| 8 Graph | `IGraphProvider` + retrieval adapter |
| 9 Multi-AI | Protocol contracts unchanged |
| 10 Enterprise | ADR-002 scope + audit extensions |

---

# Examples

## Good

- Add `VectorRetrievalCandidateSource implements IRetrievalCandidateSource`; wire in composition root; Retriever unchanged.
- Add `OpenAIEmbeddingProvider implements IEmbeddingProvider`; select via `EMBEDDING_PROVIDER` env.
- New REST `GET /memory/:id/similar` delegates to `SearchService` or new read service using `IEmbeddingStore.searchSimilar` — not repository SQL.
- MCP tool `search_memory` calls `MemoryService.searchMemory` — same as REST search path.
- `RankingEngine` receives candidates + query; returns scored list — no database import.

## Bad

- `MemoryRepository.searchSimilarByVector()` — vector logic in metadata repo.
- `MemoryService.embedOnCreate()` calling OpenAI synchronously.
- Duplicate search implementation inside `mcp/server.ts` tool handler.
- `Retriever` imports `SearchService` and wraps it.
- `AgentPlannerService` in `src/services/` coordinating multi-step tool loops.
- `GraphRepositoryV2` replacing relations repository.

---

# Checklist

## Structural review (before code)

- [ ] Layer assignment matches this document
- [ ] Dependencies flow inward only
- [ ] REST and MCP share services if both exposed
- [ ] Port identified for swappable infrastructure
- [ ] Owner scope on all persistence paths
- [ ] ADR approved if graph, hybrid, object store, or boundary change

## New capability phase

- [ ] Extends port/adapter — not repository god-method
- [ ] Public contracts additive
- [ ] Composition root updated
- [ ] [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md) extension table updated
- [ ] Separate Search vs Retriever paths preserved

## Adapter implementation

- [ ] Implements full port interface
- [ ] Owner-scoped reads, writes, deletes
- [ ] Injectable external client for tests
- [ ] No business rules in adapter beyond mapping and query

---

*Inherits from [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Operational detail: [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md). Amend only with project owner approval.*
