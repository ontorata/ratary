# Phase 7 — Agent Runtime Boundary — DESIGN

**Document:** DESIGN  
**Phase status:** Ready  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../architecture/04-ARCHITECTURE.md)

---

## 1. Purpose

Define the permanent boundary between the AI Brain memory foundation and external agent runtimes.

AI Brain provides:
- Durable memory storage and retrieval
- Knowledge enrichment
- Context assembly
- Prompt building
- MCP tools and REST API

AI Brain does **not** provide:
- Agent planning or reasoning
- Task orchestration
- Workflow execution
- Autonomous loops

This phase is **documentation-only**. No implementation code is added. The document establishes stable contracts that external agent systems consume via MCP or REST.

---

## 2. Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| Memory CRUD | Implemented (Phase 1) |
| Knowledge enrichment | Implemented (Phase 2) |
| Retrieval pipeline | Implemented (Phase 4) |
| Embedding | Implemented (Phase 5) |
| Hybrid retrieval | Implemented (Phase 6) |
| MCP protocol tools | Implemented (Phase 1+) |
| REST API | Implemented (Phase 1+) |
| Auth & permissions | Implemented (Phase 3) |

### Outside this repository

| Capability | Location |
|------------|----------|
| Agent planning | External agent runtime |
| Tool orchestration | External agent runtime |
| Task execution | External agent runtime |
| Autonomous loops | External agent runtime |
| Multi-step reasoning | External agent runtime |

### Phase 7 deliverables

1. Explicit protocol definition with versioning
2. Capability negotiation contract
3. Stable MCP tool contracts
4. Stable REST API contracts
5. Compatibility matrix for known agent clients
6. Actor model (metadata only)
7. Session model (three levels)
8. Event model (future contract only)
9. Future compatibility guarantees

---

## 3. Architecture Overview

AI Brain operates as a **stateless memory service** consumed by stateful external agent runtimes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         External Agent Runtime                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐                │
│  │   Planner   │→ │   Executor   │→ │   Tool Orchestrator │                │
│  └─────────────┘  └──────────────┘  └─────────────────────┘                │
│                              │                                                │
│                              │ "What do I know about X?"                     │
│                              ↓                                                │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    MCP / REST        │
                    │   Protocol Layer     │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                         AI Brain                                             │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                     Protocol Contracts                                 │   │
│  │  MCP Tools (14 tools)    │    REST API (/api/v1)                     │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                    Application Services                               │   │
│  │  MemoryService  │  ContextService  │  SearchService  │  KnowledgeService│   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                    Persistence Layer                                  │   │
│  │  MemoryRepository  │  EmbeddingStore  │  RelationRepository            │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Memory → Knowledge → Embedding → Retrieval → Context → Prompt               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Design invariants

1. **No agent logic inside AI Brain** — Planner, executor, and orchestrator belong to external systems.
2. **AI Brain is storage-agnostic** — Any storage engine via ports.
3. **AI Brain is retrieval-focused** — Bounded context within configurable budget.
4. **AI Brain is context-focused** — Assembles relevant memories for agent consumption.
5. **External systems communicate only through stable protocols** — MCP or REST.

---

## 4. Architecture Diagram

```
                           ┌─────────────────────────────────────┐
                           │       External Agent Runtime         │
                           │  (Planner + Executor + Tools)       │
                           └──────────────────┬──────────────────┘
                                              │
                          ┌───────────────────┴───────────────────┐
                          │        AI Brain Protocol              │
                          │  (MCP stdio / REST HTTP)              │
                          └───────────────────┬───────────────────┘
                                              │
┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
│                                             │                                              │
│  ┌─────────────────────────────────────────┴───────────────────────────────────────────┐  │
│  │                            AI Brain Memory Foundation                                │  │
│  │                                                                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                         Transport Layer                                      │  │  │
│  │  │  ┌────────────────────────────┐    ┌─────────────────────────────────────┐   │  │  │
│  │  │  │      MCP Server            │    │        REST Server (Fastify)        │   │  │  │
│  │  │  │  • stdio transport        │    │  • HTTP routing                    │   │  │  │
│  │  │  │  • JSON-RPC 2.0           │    │  • Schema validation               │   │  │  │
│  │  │  │  • Tool definitions       │    │  • Auth middleware                │   │  │  │
│  │  │  └─────────────┬────────────┘    └──────────────┬──────────────────────┘   │  │  │
│  │  └────────────────┼────────────────────────────────┼───────────────────────────┘  │
│  │                   │                                │                              │
│  │                   └──────────────┬─────────────────┘                              │
│  │                              ▼                                                   │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │                       Application Layer                                     │ │  │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────────┐ │ │  │
│  │  │  │  MemoryService   │ │  ContextService  │ │    SearchService           │ │ │  │
│  │  │  │  • CRUD         │ │  • Retrieval     │ │    • Paginated search      │ │ │  │
│  │  │  │  • Backup       │ │  • Ranking       │ │    • Hybrid sources        │ │ │  │
│  │  │  │  • Relations    │ │  • Budget        │ │                            │ │ │  │
│  │  │  └──────────────────┘ └──────────────────┘ └────────────────────────────┘ │ │  │
│  │  │  ┌──────────────────┐ ┌──────────────────┐                              │ │  │
│  │  │  │ KnowledgeService │ │  AuthService     │                              │ │  │
│  │  │  │  • Enrichment   │ │  • Identity      │                              │ │  │
│  │  │  │  • Generators   │ │  • Permissions   │                              │ │  │
│  │  │  └──────────────────┘ └──────────────────┘                              │ │  │
│  │  └────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                              │                                                   │
│  │  ┌───────────────────────────┴────────────────────────────────────────────────┐ │
│  │  │                          Domain Layer                                       │ │
│  │  │  Pure functions: ranking, scoring, normalization, text preparation        │ │
│  │  └────────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                                 │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  │                      Persistence Layer                                      │ │
│  │  │  ┌─────────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │ │  │
│  │  │  │  IMemoryRepository  │  │  IEmbeddingStore │  │ IRelationRepository  │  │ │  │
│  │  │  │  (D1 adapter)       │  │  (D1 adapter)    │  │ (D1 adapter)        │  │ │  │
│  │  │  └─────────────────────┘  └─────────────────┘  └──────────────────────┘  │ │  │
│  │  └────────────────────────────────────────────────────────────────────────────┘ │
│  │                                                                                 │
│  └─────────────────────────────────────────────────────────────────────────────────┘
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### External agent interaction flow

```
Agent Runtime                                    AI Brain
      │                                              │
      │  1. save_memory({ content, metadata })      │
      │ ──────────────────────────────────────────► │
      │                                              │
      │  2. get_context({ query, limit })           │
      │ ──────────────────────────────────────────► │
      │                                              │
      │  ◄───────── Context assembly                 │
      │  { memories[], summary, relations[] }        │
      │                                              │
      │  3. build_prompt({ context, template })     │
      │ ──────────────────────────────────────────► │
      │                                              │
      │  ◄───────── Formatted prompt                │
      │  { prompt, system, user }                    │
      │                                              │
      │  4. search_memories({ query, filters })     │
      │ ──────────────────────────────────────────► │
      │                                              │
      │  ◄───────── Search results (paginated)      │
```

---

## 5. Layer Responsibilities

### Layer assignment for agent integration

| Layer | Responsibility | Forbidden |
|-------|---------------|-----------|
| **Transport (MCP)** | Tool definitions, stdio transport, scope bootstrap | Business logic, duplicated orchestration |
| **Transport (REST)** | HTTP routing, schema validation, auth hooks | SQL, domain rules |
| **Controllers** | Request/response mapping | Business logic |
| **Application Services** | Use-case orchestration, port coordination, scope enforcement | HTTP types, raw queries |
| **Domain Logic** | Pure ranking, scoring, text transformation | I/O, persistence |
| **Persistence** | Scoped queries, row mapping, adapter-specific errors | Business rules, ranking |

### AI Brain responsibilities

| Concern | Owner | Notes |
|---------|-------|-------|
| Memory durability | `MemoryService` + `IMemoryRepository` | Owner-scoped |
| Knowledge enrichment | `KnowledgeService` | Pure generators |
| Retrieval pipeline | `ContextService` + `Retriever` | Bounded context |
| Context assembly | `ContextBuilder` | Character/token budget |
| Prompt formatting | `PromptBuilder` | Template application |
| Search | `SearchService` | Paginated results |
| Embedding | `EmbeddingJobRunner` | Async, not on CRUD |
| Auth | `AuthService` | Identity + permissions |
| MCP transport | `mcp/server.ts` | Tool delegation |
| REST transport | `routes/` + `controllers/` | HTTP mapping |

### External agent responsibilities

| Concern | Owner | Location |
|---------|-------|----------|
| Planning | Agent planner | External runtime |
| Tool orchestration | Agent executor | External runtime |
| Task queue | Agent scheduler | External runtime |
| State machine | Agent logic | External runtime |
| Reflection loop | Agent reflection | External runtime |
| Goal management | Agent goals | External runtime |

---

## 6. Repository Boundary

### What AI Brain owns

```
src/
├── auth/                 # Identity, permissions, audit
├── config/              # Environment validation
├── controllers/         # HTTP mapping
├── db/                  # Migrations, client
├── embedding/           # Inference + vector storage
├── knowledge/           # Metadata enrichment
├── memory/              # Retrieval pipeline, context
├── mcp/                 # Protocol tools
├── plugins/             # Framework extensions
├── repositories/        # Persistence adapters
├── routes/              # HTTP endpoints
├── search/              # Paginated search
├── services/            # Application orchestration
├── types/               # Domain types + schemas
└── utils/               # Mappers, formatters
```

### What AI Brain does NOT own

```
# Forbidden inside src/
├── agents/
├── planners/
├── executors/
├── orchestrators/
├── task-queues/
├── state-machines/
├── workflow-engines/
├── reflection-loops/
├── goal-stacks/
└── autonomous-loops/
```

### External agent boundary

```
External systems (outside this repository):
├── Cursor Code
├── Claude Code (via Anthropic)
├── Gemini CLI (via Google)
├── Codex CLI (via OpenAI)
├── Roo Code
├── Cline
├── OpenHands
├── Custom agent runtimes
└── Agent orchestration frameworks
```

---

## 7. External Agent Boundary

### Protocol boundary definition

External agents communicate with AI Brain through two protocol channels:

```
┌─────────────────────────────────────────────────────────┐
│                  Protocol Boundary                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────────┐      ┌───────────────────────┐   │
│  │   MCP (Primary)    │      │   REST (Alternative)  │   │
│  │   stdio transport  │      │   HTTP transport      │   │
│  │   JSON-RPC 2.0     │      │   JSON over HTTPS     │   │
│  │   14 tools          │      │   REST endpoints      │   │
│  └───────────────────┘      └───────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Agent integration contract

| Requirement | AI Brain obligation | Agent obligation |
|------------|---------------------|------------------|
| Protocol | Provide MCP + REST | Implement client |
| Auth | Validate credentials | Provide valid credentials |
| Scope | Enforce owner isolation | Scope requests correctly |
| Rate limiting | Apply per-owner limits | Respect rate limits |
| Context budget | Enforce configurable cap | Handle truncated context |
| Idempotency | Handle duplicate requests | Use idempotency keys |

### Boundary enforcement

1. **No inbound agent state** — AI Brain does not store agent execution state.
2. **No outbound agent commands** — AI Brain does not invoke external systems.
3. **No bidirectional loops** — AI Brain responds to requests; agents initiate.
4. **No shared memory between agents** — Each agent operates in its scoped context.

---

## 8. AI Brain Protocol

### Protocol definition

The AI Brain Protocol is the stable contract external agents use to interact with the memory foundation.

```
┌────────────────────────────────────────────────────────────┐
│                    AI Brain Protocol                        │
│                                                            │
│  Transport: MCP (stdio) / REST (HTTPS)                    │
│  Format: JSON-RPC 2.0 (MCP) / JSON (REST)                │
│  Authentication: API Key / JWT / OAuth                   │
│  Scope: Owner-based isolation                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Supported interfaces

| Interface | Status | Notes |
|-----------|--------|-------|
| **MCP** | ✅ Current | Primary protocol for AI agents |
| **REST** | ✅ Current | Alternative for HTTP clients |
| **gRPC** | 🔲 Reserved | Future consideration |
| **Event Bus** | 🔲 Reserved | Future Phase 10+ |

---

## 9. Protocol Version

### Versioning policy

| Version type | Current | Policy |
|--------------|---------|--------|
| **Protocol Version** | 1.0 | Major.Minor; minor additions only |
| **API Version** | 1 | In URL prefix `/api/v1/` |
| **MCP Schema Version** | 1.0 | Matches protocol version |
| **ADR Version** | Sequential | `ADR-NNN` format |
| **Phase Version** | 7 | Represents capability milestone |

### Version stability guarantees

| Version | Guarantee |
|---------|-----------|
| **1.x** | Stable until deprecated with 6-month notice |
| **Minor additions** | New optional fields, new tools (non-breaking) |
| **Major version** | Breaking changes require explicit migration path |
| **Deprecation** | Old version works for minimum 12 months |

### Version negotiation

Agents declare protocol version in request headers:

```
MCP:    MCP-Protocol-Version: 1.0
REST:   X-API-Version: 1
```

AI Brain responds with supported version or error if incompatible.

### Backward compatibility policy

1. **All 1.x versions** maintain backward compatibility.
2. **Minor additions** are always backward compatible.
3. **Breaking changes** require major version bump + migration guide.
4. **Additive changes** are the preferred evolution strategy.

### Breaking change policy

A breaking change requires:
1. Major version increment (e.g., 1.x → 2.0)
2. Written migration guide
3. Minimum 12-month deprecation window
4. Owner approval

---

## 10. Capability Negotiation

### Capability discovery contract

Agents discover AI Brain capabilities through an explicit metadata endpoint.

```typescript
interface AICapabilityManifest {
  protocolVersion: string;
  capabilities: {
    // Memory operations
    supportsMemoryCRUD: boolean;
    supportsMemoryBackup: boolean;
    supportsMemoryImport: boolean;
    
    // Knowledge operations
    supportsKnowledge: boolean;
    supportsCodename: boolean;
    supportsSlug: boolean;
    supportsKeywords: boolean;
    supportsCategories: boolean;
    
    // Retrieval operations
    supportsContextBuilder: boolean;
    supportsPromptBuilder: boolean;
    supportsRetrieval: boolean;
    supportsHybridRetrieval: boolean;
    
    // Relation operations
    supportsRelations: boolean;
    
    // Embedding operations
    supportsEmbedding: boolean;
    supportsSemanticSearch: boolean;
    
    // Future capabilities
    supportsKnowledgeGraph: boolean;  // Phase 8
    supportsWorkspace: boolean;       // Phase 9
    supportsOrganization: boolean;    // Phase 10
    
    // Scope operations
    supportsOwnerScope: boolean;      // Always true
    supportsWorkspaceScope: boolean;  // Phase 9+
    supportsAgentAttribution: boolean; // Phase 9+
  };
  
  limits: {
    maxContextTokens: number;
    maxMemoryContentBytes: number;
    maxResultsPerSearch: number;
    maxRelationsPerMemory: number;
  };
  
  version: string;
  timestamp: string;
}
```

### Capability endpoints

| Endpoint | Returns | Auth required |
|----------|---------|---------------|
| `GET /api/v1/capabilities` | Full manifest (REST) | No |
| MCP `capabilities` tool | Full manifest (MCP) | No |

### Capability matrix

| Capability | Phase introduced | Required for Phase 7 |
|------------|------------------|---------------------|
| `supportsMemoryCRUD` | 1 | Yes |
| `supportsKnowledge` | 2 | Yes |
| `supportsRetrieval` | 4 | Yes |
| `supportsContextBuilder` | 4 | Yes |
| `supportsPromptBuilder` | 4 | Yes |
| `supportsEmbedding` | 5 | Yes |
| `supportsHybridRetrieval` | 6 | Recommended |
| `supportsRelations` | 2 | Yes |
| `supportsKnowledgeGraph` | 8 | No (future) |
| `supportsWorkspace` | 9 | No (future) |

---

## 11. Stable MCP Contracts

### MCP tool registry

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| `save_memory` | `{ content, title?, project?, metadata? }` | `{ memory }` | Store new memory |
| `get_memory` | `{ memoryId }` | `{ memory }` | Retrieve by ID |
| `update_memory` | `{ memoryId, updates }` | `{ memory }` | Modify memory |
| `delete_memory` | `{ memoryId }` | `{ success }` | Remove memory |
| `search_memories` | `{ query, limit?, offset?, project? }` | `{ memories[], total }` | Keyword search |
| `list_memories` | `{ limit?, offset?, project?, archived? }` | `{ memories[] }` | List all |
| `get_context` | `{ query, limit?, project? }` | `{ memories[], summary }` | LLM context |
| `build_prompt` | `{ context, system?, template? }` | `{ prompt }` | Format prompt |
| `list_relations` | `{ memoryId }` | `{ relations[] }` | Get relations |
| `create_relation` | `{ sourceId, targetId, type? }` | `{ relation }` | Create link |
| `delete_relation` | `{ relationId }` | `{ success }` | Remove link |
| `get_memory_by_codename` | `{ codename }` | `{ memory }` | Lookup by name |
| `get_memory_by_slug` | `{ slug }` | `{ memory }` | Lookup by slug |
| `export_backup` | `{ format? }` | `{ url }` | Export memories |
| `import_backup` | `{ url }` | `{ count }` | Import memories |

### MCP tool schema rules

1. **Tool names** are immutable unless owner approves breaking change.
2. **Required parameters** may not become optional without ADR.
3. **Optional parameters** may be added without breaking change.
4. **Response fields** are additive; existing fields never removed.
5. **Error responses** follow standard shape: `{ error, message, code }`.

### MCP transport requirements

| Requirement | Value |
|-------------|-------|
| Transport | stdio (JSON-RPC 2.0) |
| Authentication | `MCP_OWNER_ID` environment variable |
| Scope | Single owner per MCP process |
| Max request size | 1MB |
| Response timeout | 30 seconds |
| Rate limit | 100 requests/minute/owner |

---

## 12. Stable REST Contracts

### REST API surface

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `POST` | `/api/v1/memories` | Create memory | Required |
| `GET` | `/api/v1/memories` | List memories | Required |
| `GET` | `/api/v1/memories/:id` | Get by ID | Required |
| `PATCH` | `/api/v1/memories/:id` | Update | Required |
| `DELETE` | `/api/v1/memories/:id` | Delete | Required |
| `POST` | `/api/v1/memories/search` | Search | Required |
| `POST` | `/api/v1/context` | Build context | Required |
| `POST` | `/api/v1/prompt` | Build prompt | Required |
| `GET` | `/api/v1/memories/:id/relations` | List relations | Required |
| `POST` | `/api/v1/memories/:id/relations` | Create relation | Required |
| `DELETE` | `/api/v1/relations/:id` | Delete relation | Required |
| `GET` | `/api/v1/memories/by-codename/:codename` | By codename | Required |
| `GET` | `/api/v1/memories/by-slug/:slug` | By slug | Required |
| `POST` | `/api/v1/backup/export` | Export | Required |
| `POST` | `/api/v1/backup/import` | Import | Required |
| `GET` | `/api/v1/health` | Health check | None |

### REST contract rules

1. **Path structure** — All memory endpoints under `/api/v1/memories`.
2. **Response format** — `{ data, meta? }` for success; `{ error, message, details? }` for errors.
3. **Pagination** — Cursor-based with `limit` (default 20, max 100) and `offset`.
4. **Field naming** — camelCase in JSON; snake_case in database.
5. **Timestamps** — ISO 8601 UTC strings.
6. **Content-Type** — `application/json` for all requests and responses.

### REST versioning

| Version | Prefix | Status |
|---------|--------|--------|
| 1 | `/api/v1/` | Current |
| 2 | `/api/v2/` | Reserved |

---

## 13. Compatibility Matrix

### Known agent clients

| Client | REST | MCP | Context | Prompt | Relations | Future Graph | Future Vector |
|--------|------|-----|---------|--------|-----------|--------------|---------------|
| **Cursor** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **Claude Code** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **Gemini CLI** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **Codex CLI** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **Roo Code** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **Cline** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **OpenHands** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **OpenAI SDK** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |
| **Custom Agent** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 🔲 Phase 8 | ✅ Phase 6 |

### Compatibility verification

| Requirement | Verification method |
|-------------|---------------------|
| REST compatibility | Integration tests with `supertest` |
| MCP compatibility | MCP tool tests with `InMemoryTransport` |
| Context quality | Retrieval pipeline tests |
| Prompt formatting | PromptBuilder unit tests |
| Relation integrity | Relation repository tests |

### Protocol support by phase

| Phase | REST support | MCP support | Notes |
|-------|--------------|--------------|-------|
| 1 | Basic CRUD | Basic tools | Foundation |
| 2 | + Search | + Search | Knowledge |
| 3 | + Auth | + Auth | Authorization |
| 4 | + Context | + Context | Intelligence |
| 5 | + Embedding | + Embedding | Async enrichment |
| 6 | + Hybrid | + Hybrid | Vector + SQL |
| 7 | Stable | Stable | Boundary defined |
| 8 | + Graph | + Graph | Traversal |
| 9 | + Workspace | + Workspace | Multi-AI |
| 10 | + Org | + Org | Enterprise |

---

## 14. Actor Model

### Actor types

AI Brain tracks actors as metadata on memory operations. Actors are **metadata only** — no execution state is stored.

| Actor Type | Definition | Identifier | Phase |
|------------|------------|------------|-------|
| **Human** | End user operating through UI or API | `ownerId` | 1+ |
| **AI** | Non-human actor (coding assistant, bot) | `agentId` | 9+ |
| **Automation** | Scheduled scripts, CI/CD pipelines | `ownerId` + `automationId` | 3+ |
| **Webhook** | External systems calling REST | `ownerId` + `source` | 1+ |
| **GitHub Action** | CI/CD integration | `ownerId` + `workflowId` | 1+ |
| **Cron** | Scheduled maintenance jobs | `ownerId` + `jobId` | 1+ |
| **MCP Client** | AI tool using MCP protocol | `ownerId` (env-scoped) | 1+ |
| **Future Service** | Microservice integrations | `ownerId` + `serviceId` | 9+ |
| **Future Organization** | Multi-tenant enterprise | `organizationId` | 10+ |

### Actor metadata contract

```typescript
interface ActorMetadata {
  actorType: ActorType;
  actorId: string;
  actorName?: string;
  actorSource?: string;  // For webhooks, GitHub Actions
  timestamp: string;      // ISO 8601
  sessionId?: string;   // For session-scoped operations
}

type ActorType = 
  | 'human'
  | 'ai'
  | 'automation'
  | 'webhook'
  | 'github_action'
  | 'cron'
  | 'mcp_client'
  | 'future_service'
  | 'future_organization';
```

### Actor tracking rules

1. **No execution state** — AI Brain stores who did what, not what they were doing.
2. **Audit trail** — Actor metadata enables future audit requirements.
3. **Attribution** — Phase 9 enables `agentId` attribution for multi-AI scenarios.
4. **Isolation** — Actor type does not affect scope enforcement.

### Future actor extensions

| Phase | Extension | Implementation |
|-------|-----------|----------------|
| 9 | `agentId` in `MemoryScope` | Optional field, undefined until Phase 9 |
| 9 | Agent registry | `IAgentIdentity` port |
| 9 | Sync conflict metadata | `ISyncManager` port |
| 10 | Organization actors | `organizationId` in scope |

---

## 15. Session Model

### Three levels of memory scope

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Persistent Memory                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  • Durable memories owned by owner                            │  │
│  │  • Survives sessions                                          │  │
│  │  • Accessed via: save_memory, get_memory, search_memories    │  │
│  │  • Scope: ownerId (required)                                  │  │
│  │  • Lifetime: Until explicitly deleted                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                     Workspace Memory                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  • Shared pool for team/product (Phase 9)                    │  │
│  │  • Multiple agents can read/write                              │  │
│  │  • Scope: ownerId + workspaceId (Phase 9)                     │  │
│  │  • Lifetime: Until workspace deleted or memory removed        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                     Session Memory                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  • Ephemeral context for single task (Phase 7 boundary)       │  │
│  │  • NOT stored in AI Brain                                      │  │
│  │  • External agent manages session state                         │  │
│  │  • Scope: Agent's in-memory context                            │  │
│  │  • Lifetime: Until agent session ends                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                     Temporary Context                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  • Bounded context assembled for LLM consumption              │  │
│  │  • NOT persisted beyond retrieval                              │  │
│  │  • Assembled via: get_context, build_prompt                   │  │
│  │  • Scope: Retrieval query + context budget                     │  │
│  │  • Lifetime: Single request/response cycle                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Memory ownership model

| Level | Owner | Read access | Write access | Lifetime |
|-------|-------|-------------|--------------|----------|
| **Persistent** | Owner | Owner only | Owner only | Permanent |
| **Workspace** | Workspace | Workspace members | Workspace members | Until deleted |
| **Session** | Agent runtime | Agent only | Agent only | Session only |
| **Temporary** | AI Brain | Requester only | N/A | Request only |

### Session boundaries

1. **AI Brain is stateless** — No session state stored in the foundation.
2. **Agents manage sessions** — External runtime tracks agent session state.
3. **Context is request-scoped** — `get_context` assembles per request.
4. **No session cookies** — REST uses Bearer tokens; MCP uses env credentials.

### Future session extensions

| Phase | Extension | Notes |
|-------|-----------|-------|
| 9 | Workspace-scoped sessions | Multiple agents share workspace |
| 9 | Session history | Audit trail of agent sessions |
| 10 | Organization sessions | Org-level session policies |

---

## 16. Memory Scope

### Current scope model (Phase 7)

```typescript
interface MemoryScope {
  ownerId: string;  // Required — identity anchor
}
```

### Scope resolution

| Channel | Resolution method | Scope source |
|---------|-------------------|--------------|
| **REST** | Bearer token → JWT claims → `request.user.ownerId` | Auth middleware |
| **MCP** | `MCP_OWNER_ID` environment variable | Server bootstrap |
| **API Key** | `X-API-Key` header → `owner_id` lookup | Auth service |

### Scope enforcement

1. **Every query** includes `ownerId` filter.
2. **Every write** includes `ownerId` in scope validation.
3. **Cross-scope access** returns 404 — never 403 (prevents enumeration).
4. **Scope is immutable** — Cannot be changed after memory creation.

### Future scope extensions (per ADR-002)

```typescript
// Phase 9+ (additive — no breaking changes)
interface MemoryScope {
  ownerId: string;              // Required — legacy + identity anchor
  organizationId?: string;        // Phase 10
  workspaceId?: string;          // Phase 9+
  agentId?: string;             // Phase 9+ — actor attribution
  projectId?: string;           // Filter hint (Phase 2.6+)
}
```

### Scope contract rules

| Rule | Description |
|------|-------------|
| Required fields | `ownerId` always required |
| Optional fields | Future fields nullable until phase activates |
| Query behavior | Optional fields filter when present; ignored when null |
| Write behavior | Optional fields writable when phase enabled |
| Backward compatibility | Solo `ownerId` works indefinitely |

---

## 17. Event Model (Future Only)

### Event contract (Phase 10+)

This section defines the **contract** for future event bus integration. No implementation in Phase 7.

```typescript
// Future event types (Phase 10+)
interface MemoryCreatedEvent {
  event: 'memory.created';
  memoryId: string;
  ownerId: string;
  actor: ActorMetadata;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface MemoryUpdatedEvent {
  event: 'memory.updated';
  memoryId: string;
  ownerId: string;
  changes: string[];
  actor: ActorMetadata;
  timestamp: string;
}

interface MemoryDeletedEvent {
  event: 'memory.deleted';
  memoryId: string;
  ownerId: string;
  actor: ActorMetadata;
  timestamp: string;
  archived: boolean;  // Soft delete vs hard delete
}

interface ContextGeneratedEvent {
  event: 'context.generated';
  query: string;
  memoryIds: string[];
  ownerId: string;
  tokenCount: number;
  timestamp: string;
}

interface RelationCreatedEvent {
  event: 'relation.created';
  relationId: string;
  sourceId: string;
  targetId: string;
  ownerId: string;
  actor: ActorMetadata;
  timestamp: string;
}
```

### Event subscription contract

```typescript
interface IEventBus {
  // Phase 10+ — not implemented in Phase 7
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): Promise<void>;
  unsubscribe(eventType: string, handlerId: string): Promise<void>;
}
```

### Event model constraints

1. **No event bus in Phase 7** — Events are future contract only.
2. **No event handlers** — AI Brain does not react to external events.
3. **Events are audit-only** — Future audit trail, not trigger mechanism.
4. **Scope-enforced** — Events only visible to owning scope.

### Future event extensions

| Phase | Events | Purpose |
|-------|--------|---------|
| 8 | `relation.*` | Graph maintenance |
| 9 | `agent.*`, `workspace.*` | Multi-AI coordination |
| 10 | `organization.*`, `audit.*` | Enterprise compliance |

---

## 18. Versioning Policy

### Protocol versioning

| Version aspect | Current | Increment policy |
|----------------|---------|------------------|
| **Protocol version** | 1.0 | Minor additions (fields, tools) |
| **Major version** | 1 | Breaking changes require major bump |

### Version lifecycle

```
1.0.0 → 1.1.0 (additive) → 1.2.0 (additive) → 2.0.0 (breaking)
   │                                              │
   └──────── Stable ──────────────────────────────┘
```

### API versioning

| Version | Prefix | Status | Sunset date |
|---------|--------|--------|-------------|
| 1 | `/api/v1/` | Current | TBD |
| 2 | `/api/v2/` | Reserved | — |

### Tool versioning

| Tool | Version | Breaking change policy |
|------|---------|------------------------|
| MCP tools | 1.0 | Major bump for removal; minor for additions |
| REST endpoints | 1.0 | Major bump for removal; minor for additions |

### ADR versioning

| ADR | Status | Contract version |
|-----|--------|------------------|
| ADR-001 | Implemented | Protocol 1.0 |
| ADR-002 | Approved | Scope contract |
| ADR-003 | Implemented | Embedding contract |
| ADR-004 | Implemented | Repository port contract |
| ADR-005 | Implemented | Content store contract |

### Phase versioning

| Phase | Status | Scope |
|-------|--------|-------|
| 1 | Complete | Foundation |
| 2 | Complete | Knowledge |
| 3 | Complete | Authorization |
| 4 | Complete | Intelligence |
| 5 | Complete | Embedding |
| 6 | Complete | Hybrid retrieval |
| 7 | Ready | Agent boundary |
| 8 | Future | Knowledge graph |
| 9 | Future | Multi-AI |
| 10 | Future | Enterprise |

### Future migration policy

| Trigger | Migration path |
|---------|-----------------|
| Major version bump | 12-month deprecation window + migration guide |
| Schema evolution | Phased: add → backfill → index → deprecate |
| Contract break | Owner approval + ADR + migration |

---

## 19. Future Compatibility

### Phase 8 readiness — Knowledge Graph

Phase 7 design enables Phase 8 integration without rewrites:

| Design element | Phase 8 impact | Mitigation |
|---------------|-----------------|------------|
| `MemoryScope` | Gains optional `workspaceId` | ADR-002 contract preserved |
| `IGraphProvider` | New port + adapter | Does not touch `MemoryService` |
| Relations | Flat edges remain stable | No `RelationsV2` |
| Retrieval | Graph source in composite | Same `IRetrievalCandidateSource` |

### Phase 9 readiness — Multi-AI

Phase 7 design enables Phase 9 integration without rewrites:

| Design element | Phase 9 impact | Mitigation |
|---------------|-----------------|------------|
| `MemoryScope` | Gains `agentId`, `workspaceId` | Optional fields; `ownerId` unchanged |
| `IAgentIdentity` | New port | Does not touch core services |
| `ISyncManager` | New port | External orchestration; contract defined below |

### ISyncManager contract (Phase 9)

```typescript
// Multi-agent write reconciliation contract (Phase 9 — not implemented in Phase 7)
interface ISyncManager {
  reconcileWrite(event: MemoryWriteEvent): Promise<'accept' | 'merge' | 'reject'>;
  resolveConflict(memoryId: string, versions: MemoryVersion[]): Promise<ResolvedMemory>;
  getStrategy(workspaceId: string): Promise<SyncStrategy>;
}

interface MemoryWriteEvent {
  memoryId: string;
  ownerId: string;
  agentId: string;
  workspaceId: string;
  version: number;
  timestamp: string;
}

type SyncStrategy = 'last-write-wins' | 'agent-priority' | 'merge';
```

| MCP tools | Additive scope fields | Tool schemas unchanged |

### Phase 10 readiness — Enterprise

Phase 7 design enables Phase 10 integration without rewrites:

| Design element | Phase 10 impact | Mitigation |
|---------------|-----------------|------------|
| `MemoryScope` | Gains `organizationId` | Optional field |
| Auth | Org-level RBAC | `IWorkspaceMembership` port |
| Audit | Event contracts defined | Only future bus implementation |
| Storage | Postgres adapter | Same ports; D1 adapter unchanged |

### Three-phase horizon guarantee

The Phase 7 boundary design guarantees:

1. **No agent logic inside** — Phases 8-10 add graph, workspace, org — not agent orchestration.
2. **Ports unchanged** — Existing ports (`IMemoryRepository`, `IRetrievalCandidateSource`) survive Phases 8-10.
3. **Contracts additive** — New capabilities extend scope types, not replace them.
4. **MCP/REST stable** — Tool names and REST paths remain stable across phases.

### Design decisions preventing rewrites

| Decision | Phase 7 guarantee | Future phases benefit |
|----------|-------------------|----------------------|
| No agent state in repo | Phase 7 boundary document | No migration needed |
| `ownerId` required | Scope contract | `workspaceId` additive |
| Flat relations | `MemoryRelationRepository` stable | Graph port adds traversal |
| Port-based embedding | `IEmbeddingStore` contract | Vector engine swap |
| Composition root wiring | Services receive ports | New adapters plug in |

---

## 20. Constitution Compliance

### Constitutional alignment

| Constitution rule | Phase 7 compliance |
|------------------|-------------------|
| Boundary discipline | ✅ Agent loops external; MCP/REST only |
| Replaceability | ✅ Ports for all swappable infra |
| Owner sovereignty | ✅ `ownerId` scope enforced everywhere |
| Inward dependencies | ✅ All deps point to domain |
| Layer separation | ✅ Transport → Application → Domain ← Persistence |
| Single canonical owner | ✅ One service per concern |
| Pure domain cores | ✅ Ranking, scoring, generators pure |
| Stable public surface | ✅ MCP + REST contracts documented |
| Additive first | ✅ New capabilities via extension |
| Protocol-native access | ✅ MCP primary; REST alternative |
| Context efficiency | ✅ Budget enforced in `ContextBuilder` |

### Forbidden patterns prevented

| Forbidden pattern | Phase 7 prevention |
|------------------|---------------------|
| Agent reasoning inside foundation | ✅ Documented boundary; no implementation |
| Planner | ✅ External to repository |
| Executor | ✅ External to repository |
| Workflow Engine | ✅ External to repository |
| State Machine | ✅ External to repository |
| Goal Stack | ✅ External to repository |
| Reflection Loop | ✅ External to repository |
| Task Queue | ✅ External to repository |
| Agent Runtime | ✅ External to repository |

### Constitutional checklist

- [x] AI Brain remains storage-agnostic (ports defined)
- [x] AI Brain remains retrieval-focused (pipeline documented)
- [x] AI Brain remains context-focused (ContextBuilder described)
- [x] AI Brain never becomes an agent runtime (boundary enforced)
- [x] External AI systems communicate only through stable protocols (MCP + REST)
- [x] No planner, executor, workflow engine, or autonomous loop in repo
- [x] Clean Architecture preserved (layers documented)
- [x] Repository Pattern preserved (ports defined)
- [x] Dependency direction preserved (diagram shows inward)
- [x] Storage Abstraction preserved (ports for all backends)
- [x] Knowledge Abstraction preserved (`KnowledgeService`)
- [x] Retrieval Abstraction preserved (`IRetrievalCandidateSource`)
- [x] Future Vector Layer preserved (`IEmbeddingStore`)
- [x] Future Graph Layer preserved (`IGraphProvider` contract)
- [x] Future Agent Layer excluded (boundary document)

---

## 21. Success Criteria

### Phase 7 success criteria

| Criterion | Verification | Evidence |
|-----------|--------------|----------|
| Protocol defined | Stable contracts documented | This document |
| MCP contracts stable | 14 tools documented | Section 11 |
| REST contracts stable | Endpoints documented | Section 12 |
| Compatibility matrix | 9 agent clients mapped | Section 13 |
| Actor model defined | 9 actor types defined | Section 14 |
| Session model defined | 4 memory levels defined | Section 15 |
| Event model reserved | Future contract documented | Section 17 |
| Future compatibility | Phase 8-10 readiness | Section 19 |
| Constitution compliance | 17 checklist items | Section 20 |

### Success indicators

1. **External agents can complete save → context → act loop via MCP**
   - Verified by: MCP tool documentation
   - Evidence: Section 11 tool registry

2. **No agent planner code in `src/services/` or `src/memory/`**
   - Verified by: Repository scan
   - Evidence: Section 6 forbidden patterns

3. **Constitution boundary preserved**
   - Verified by: 08-REVIEW-CHECKLIST
   - Evidence: Section 20 compliance

4. **Protocol contracts stable for agent consumers**
   - Verified by: Compatibility matrix
   - Evidence: Section 13

### Deliverables

| Deliverable | Status |
|-------------|--------|
| Protocol definition | ✅ Complete |
| Capability negotiation | ✅ Complete |
| Stable MCP contracts | ✅ Complete |
| Stable REST contracts | ✅ Complete |
| Compatibility matrix | ✅ Complete |
| Actor model | ✅ Complete |
| Session model | ✅ Complete |
| Event model (future) | ✅ Complete |
| Future compatibility | ✅ Complete |
| Constitution compliance | ✅ Complete |

---

## 22. Risks

### Identified risks

| Risk | Likelihood | Impact | Mitigation |
|------|-------------|--------|------------|
| Agent clients expect stateful memory | Low | High | Document stateless contract; external agents manage state |
| Protocol drift between REST and MCP | Low | Medium | Single service layer; shared contracts |
| Scope expansion breaks backward compat | Low | High | ADR-002 contract; additive fields only |
| Agent integration requires new ports | Low | Low | Phase 9 ports defined in ADR-002 |
| Graph layer requires RelationsV2 | Low | Medium | Flat relations remain; `IGraphProvider` separate |

### Mitigated risks

| Risk | Mitigation strategy |
|------|---------------------|
| Agent assumes shared state | Section 15: AI Brain is stateless |
| Agent stores execution state in repo | Section 6: Forbidden patterns documented |
| Phase 8 requires RelationsV2 | Section 19: Graph port separate from relations |
| Phase 9 requires `MemoryService` rewrite | Section 19: Scope resolver pattern preserves services |
| Phase 10 requires breaking changes | Section 18: 12-month deprecation policy |

### Deferred risks

| Risk | Phase | Tracking |
|------|-------|----------|
| Event bus performance at scale | 10 | Event contracts defined; implementation deferred |
| Workspace isolation performance | 9 | Query patterns defined; index strategy deferred |
| Graph traversal at scale | 8 | Port defined; D1 CTE vs external engine deferred |

---

## 23. References

### Governance documents

| Document | Relevance |
|----------|-----------|
| [00-CONSTITUTION.md](../../constitution/00-CONSTITUTION.md) | Immutable law; boundary rules |
| [04-ARCHITECTURE.md](../../architecture/04-ARCHITECTURE.md) | Layer boundaries; ports |
| [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) | Phase 7 scope |
| [GLOSSARY.md](../../glossary/GLOSSARY.md) | Canonical terms |

### ADRs

| ADR | Title | Phase 7 relevance |
|-----|-------|-------------------|
| [ADR-001](../../docs/adr/001-multi-source-retrieval.md) | Multi-source retrieval | Enables richer context |
| [ADR-002](../../docs/adr/002-workspace-identity-model.md) | Workspace identity | Scope contract for Phase 9+ |
| [ADR-003](../../docs/adr/003-embedding-storage-mvp.md) | Embedding storage | Vector retrieval foundation |
| [ADR-004](../../docs/adr/004-repository-port-types.md) | Repository ports | Storage abstraction |
| [ADR-005](../../docs/adr/005-content-object-store.md) | Content store | Future blob offload |

### Phase documents

| Phase | Document | Phase 7 relation |
|-------|----------|-----------------|
| 6 | [06-hybrid-retrieval/DESIGN.md](../06-hybrid-retrieval/DESIGN.md) | Hybrid retrieval enables richer context |
| 8 | [08-knowledge-graph/DESIGN.md](../08-knowledge-graph/DESIGN.md) | Future: graph-augmented retrieval |
| 9 | [09-multi-ai/DESIGN.md](../09-multi-ai/DESIGN.md) | Future: workspace scope |

### External references

| Reference | Relevance |
|-----------|-----------|
| MCP Protocol Specification | Tool definition standard |
| JSON-RPC 2.0 Specification | MCP transport format |
| REST API Design Best Practices | Endpoint conventions |
| Clean Architecture (Robert C. Martin) | Layer principles |

---

*Subordinate to [00-CONSTITUTION.md](../../constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../architecture/04-ARCHITECTURE.md). Do not contradict Approved ADRs.*
