# 04 — Architecture

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Defines system structure; operational phase status lives in [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md).

---

# Purpose

Define the structural architecture of the AI Brain memory foundation.

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
- ADR content and approval → [../adr/POLICY.md](../../../docs/adr/POLICY.md), [adr/](../../../docs/adr/)
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

## Transport layer (Phase 10.5 — planned)

**Status:** Design draft — [ADR-027](../../../.ai/adr/027-transport-connectivity-layer.md) Proposed · [10.5 DESIGN](../../phases/10.5-transport-connectivity/DESIGN.md)

**Owns:** protocol adapters (REST, MCP stdio, optional gRPC), `TransportContext`, shared application handlers, transport registry, manifest transport section.

**Target structure:**

```
transport/
  shared/     TransportContext, handlers (thin), scope unify
  rest/       Fastify bootstrap, routes, controllers
  mcp/        stdio server, tools → handlers
  grpc/       opt-in; GRPC_ENABLED=false default
  registry/   ITransportServer lifecycle, startAll/stopAll
```

**Rules:**

- All transports delegate to the **same** shared handlers → **same** application services.
- MCP does not traverse REST (preserved).
- `services/` MUST NOT import Fastify, MCP SDK, or gRPC libraries.
- REST remains **public API** (`/api/v1`). MCP remains **AI protocol** (stdio). gRPC is **internal/enterprise opt-in**.
- SDK (`@ai-brain/client`) lives **outside** repo — repo publishes OpenAPI + proto only.
- GraphQL deferred — separate ADR required.

**Protocol roles:**

| Protocol | Primary audience | Default |
|----------|------------------|---------|
| REST | Public integrators, ChatGPT Actions | ✅ always |
| MCP stdio | IDE-embedded AI clients | ✅ always |
| gRPC | Batch ingest, streaming context, service mesh | ❌ opt-in |

---

## Protocol layer (Phase 13 — planned)

**Status:** Design draft — [ADR-028](../../../.ai/adr/028-protocol-layer.md) Proposed · [13-protocol-layer DESIGN](../../phases/13-protocol-layer/DESIGN.md)  
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

**Additive API:** `GET /api/v1/context/stream` (SSE). Existing REST v1 unary endpoints unchanged.

---

## Federation layer (Phase 14 — planned)

**Status:** Design draft — [ADR-029](../../../.ai/adr/029-federation-layer.md) Proposed · [14-federation DESIGN](../../phases/14-federation/DESIGN.md)  
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

**Not yet implemented.** Requires approved [ADR-001](../../../docs/adr/001-multi-source-retrieval.md).

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

**Not yet implemented.** Requires `IGraphProvider` per [ADR-002](../../../docs/adr/002-workspace-identity-model.md) path.

**Planned extension:**

- `IGraphProvider` — traversal, neighborhood queries, path finding.
- `MemoryRelationRepository` remains for flat edge CRUD — not replaced by V2.
- Graph-augmented retrieval via new `IRetrievalCandidateSource` adapter.
- Workspace/agent/org scope fields additive to `MemoryScope` per ADR-002.

---

## Future agent layer (Phase 7+)

**Outside this repository.**

Agents, planners, and executors consume:

- MCP tools (`save_memory`, `get_context`, `search_memory`, …)
- REST `/api/v1/*`

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
