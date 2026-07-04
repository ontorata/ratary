# Phase 7 — Agent Runtime Boundary — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Closed — gate PASS (2026-07-03  )  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)

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
│  │  MCP Tools (22 — SSOT)   │    REST API (/api/v1)                     │   │
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
│  │   22 tools (SSOT)     │      │   REST endpoints      │   │
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

  /** Standard REST/MCP error codes agents should handle (maps to AppError.code). */
  errorCodes: {
    code: string;
    httpStatus: number;
    when: string;
  }[];

  /** Soft rate-limit expectations per capability group (enforced on REST auth; MCP stdio advisory). */
  rateLimits: {
    capabilityGroup: string;
    limit: string;
    scope: string;
    notes?: string;
  }[];

  version: string;
  timestamp: string;
}
```

**Standard `errorCodes` (S1):**

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Zod/body validation failed (e.g. summary >300 chars) |
| `UNAUTHORIZED` | 401 | Missing or invalid API key / JWT |
| `FORBIDDEN` | 403 | Valid auth but insufficient permission or revoked identity |
| `NOT_FOUND` | 404 | Memory/relation/workspace not found or cross-owner scope |
| `DATABASE_ERROR` | 500 | D1/Postgres persistence failure |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

MCP tools surface failures as `isError: true` on the tool result with message text; agents should map known substrings/codes where exposed.

**Rate limits per capability (S2):**

| Capability group | Limit | Scope | Enforcement |
|------------------|-------|-------|-------------|
| Auth bootstrap / identities | 5/h bootstrap; 20/min create; 10/min rotate | Per client IP | REST `@fastify/rate-limit` (`src/plugins/rate-limit.ts`); Redis when `RATE_LIMIT_REDIS_URL` set |
| Memory CRUD / search / context | 100 req/min (design advisory) | Per owner | Not hard-limited on MCP stdio; REST global advisory |
| Graph traverse | Same as memory | Per owner | Expensive BFS — keep `depth` ≤3 |
| Backup import/export | Same as memory | Per owner | Large payloads — respect `maxMemoryContentBytes` |
| Health / docs / graph capabilities | Unlimited | Public | No auth on `/health`, `/docs` |

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

### JSON-RPC examples (S3)

MCP uses **JSON-RPC 2.0** over stdio. Tool invocations use `tools/call`; responses wrap JSON in `content[].text`.

**Request envelope:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "save_memory",
    "arguments": {
      "title": "Auth middleware pattern",
      "content": "## JWT validation\n...",
      "project": "ai-brain",
      "tags": ["auth"]
    }
  }
}
```

**Success response envelope:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \"id\": \"…\", \"codename\": \"AUTH-0001\", \"title\": \"Auth middleware pattern\" }"
      }
    ],
    "isError": false
  }
}
```

**Error response (tool failure):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "Memory with id '…' not found" }],
    "isError": true
  }
}
```

**Per-tool `arguments` → `content[].text` payload (22 tools — SSOT `MCP_TOOL_NAMES`; gate verified 19, implementation `src/transport/mcp/mcp-server.ts`):**

| Tool | Example `arguments` | Response `text` (JSON) |
|------|---------------------|-------------------------|
| `save_memory` | `{ "title", "content", "project?", "tags?", "metadata?" }` | `Memory` object |
| `update_memory` | `{ "id", "title?", "content?", "metadata?" }` | `Memory` object |
| `delete_memory` | `{ "id" }` | Plain success string |
| `get_memory` | `{ "id" }` | `Memory` object |
| `get_memory_by_codename` | `{ "codename": "AUTH-0001" }` | `Memory` object |
| `search_memory` | `{ "q?", "project?", "limit?", "offset?" }` | `{ memories, total }` |
| `list_projects` | `{}` | `{ projects: string[] }` |
| `list_tags` | `{}` | `{ tags: string[] }` |
| `link_memories` | `{ "sourceId", "targetId", "relation" }` | `MemoryRelation` |
| `list_relations` | `{ "id" }` | `{ relations: [...] }` |
| `toggle_favorite` | `{ "id" }` | `Memory` object |
| `archive_memory` | `{ "id" }` | `Memory` object |
| `get_context` | `{ "query?", "limit?", "max_chars?", "content_mode?", "summary_only?", "include_body?" }` | `{ context, memories, ... }` |
| `build_prompt` | `{ "task", "query?", "system_role?", "max_chars?", "summary_only?", "include_body?" }` | `{ system, user, context }` |
| `get_graph_capabilities` | `{}` | `{ capabilities: {...} }` |
| `traverse_relations` | `{ "memoryId", "depth?", "types?" }` | `{ memoryIds, neighbors }` |
| `list_workspaces` | `{}` | `{ workspaces: [...] }` |
| `list_agents` | `{}` | `{ agents: [...] }` |
| `register_agent` | `{ "name", "agent_type?", "metadata?" }` | `Agent` object |
| `get_capabilities` | `{}` | Capability manifest (ADR-025) |
| `run_stewardship` | `{ "dryRun?", "limit?" }` | Stewardship run summary |
| `get_compression_status` | `{ "memoryId?" }` | Compression status payload |

Contract tests: `tests/mcp/tools.test.ts` (`EXPECTED_TOOLS` ↔ `MCP_TOOL_NAMES`).

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

### OpenAPI schema reference (S4)

| Resource | URL | Notes |
|----------|-----|-------|
| Swagger UI | `GET /docs` | Interactive explorer (disabled on Vercel serverless — `skipSwagger` when `VERCEL` set) |
| OpenAPI JSON | `GET /docs/json` | OpenAPI 3.0 document generated by `@fastify/swagger` |
| OpenAPI YAML | `GET /docs/yaml` | Same spec, YAML encoding |
| Source | `src/plugins/swagger.ts` | Tags: Health, Auth, Memory, Knowledge, Search, Backup |

**Example — discover spec locally:**

```bash
curl -s http://localhost:3000/docs/json | jq '.info,.paths["/api/v1/memory"]'
```

**Auth in OpenAPI:** `components.securitySchemes.ApiKeyAuth` (`X-API-Key`) and `BearerAuth` (`Authorization: Bearer aic_…`).

**Canonical paths:** Memory routes live under `/api/v1/memory` (singular), not `/memories` — see `src/routes/index.ts` + route registration in `src/routes/v1/index.ts`.

---

## 13. Compatibility Matrix

> **Snapshot note:** Matrix authored at Phase 7 gate (2026-07-03). **Updated 2026-07-04** — Graph (Phase 8) and downstream MCP tools reflected below. All listed clients share the **same server surface**; differences are client UX only.

### Known agent clients

| Client | REST | MCP | Context | Prompt | Relations | Graph (MCP + opt-in leg) | Hybrid / vector |
|--------|------|-----|---------|--------|-----------|--------------------------|-----------------|
| **Cursor** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **Claude Code** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **Gemini CLI** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **Codex CLI** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **Roo Code** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **Cline** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **OpenHands** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **OpenAI SDK** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |
| **Custom Agent** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Phase 8+ | ✅ Phase 6+ opt-in |

**Graph:** MCP `get_graph_capabilities`, `traverse_relations` (BFS depth 1–3). Composite graph leg + one-hop relations in `get_context` when `GRAPH_RETRIEVAL=true` (Phase 6.5 relations stage).

**Hybrid / vector:** Composite vector leg when `HYBRID_RETRIEVAL=true` + embedding provider configured; default deploy remains SQL-only.

### Post–Phase 7 MCP extensions (same client compatibility)

| Capability | Landed | MCP tool / REST |
|------------|--------|-----------------|
| Capability manifest | 7.5 | `get_capabilities`, `GET /api/v1/capabilities` |
| Workspace scope | 9 | `list_workspaces` |
| Agent identity | 9 | `list_agents`, `register_agent` |
| Memory stewardship | 04.7 | `run_stewardship` |
| Compression status | 5.5 | `get_compression_status` |
| Admin compression batch | 5.5 | `POST /api/v1/admin/compress` (REST) |

Registry SSOT: `src/capabilities/mcp-tool-names.ts` (22 tools at 2026-07-04).

### Compatibility verification

| Requirement | Verification method |
|-------------|---------------------|
| REST compatibility | Integration tests with `supertest` |
| MCP compatibility | MCP tool tests with `InMemoryTransport` |
| Context quality | Retrieval pipeline tests |
| Prompt formatting | PromptBuilder unit tests |
| Relation integrity | Relation repository tests |
| Graph MCP | `traverse_relations` + graph service tests |
| Manifest parity | `manifest-contract.test.ts`, `capabilities.test.ts` |

### Protocol support by phase

| Phase | REST support | MCP support | Notes |
|-------|--------------|--------------|-------|
| 1 | Basic CRUD | Basic tools | Foundation |
| 2 | + Search | + Search | Knowledge |
| 3 | + Auth | + Auth | Authorization |
| 4 | + Context | + Context | Intelligence |
| 5 | + Embedding | + Embedding | Async enrichment |
| 6 | + Hybrid | + Hybrid | Vector + SQL (opt-in) |
| 7 | Stable | Stable | **Boundary defined — agent external** |
| 8 | + Graph | + Graph | `traverse_relations`, graph leg |
| 9 | + Workspace | + Workspace / agents | Multi-AI scope |
| 10 | + Org | + Org | Enterprise adapters |
| 7.5 | + Capabilities | + `get_capabilities` | ADR-025 manifest |
| 6.5 | + `retrievalPlan` | unchanged signatures | Progressive retrieval |

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
  organizationId?: string;  // Phase 10 enterprise actor tracking
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

### `organizationId` on actors (P1)

Enterprise actors (Phase 10+) carry optional `organizationId` on `ActorMetadata`, aligned with `MemoryScope.organizationId` in `src/types/memory-scope.ts` and [ADR-002](../../../docs/adr/002-workspace-identity-model.md) / [ADR-010](../../../docs/adr/010-workspace-membership-rbac.md).

| Field | Required when | Source | Notes |
|-------|---------------|--------|-------|
| `actorId` | Always | JWT `sub`, API key identity, or MCP env | Primary actor identifier |
| `organizationId` | `actorType === 'future_organization'` or org-scoped JWT | JWT `organization_id` claim or workspace → org lookup | Must match event/memory scope when present |
| `actorSource` | Webhooks, GitHub Actions, automation | Caller metadata | Does not replace scope |

**Population rules:**

1. **Phase 7–9** — `organizationId` omitted on all actor records; scope remains `ownerId` (+ optional `workspaceId` / `agentId` from Phase 9).
2. **Phase 10** — When JWT includes `organization_id`, copy to `ActorMetadata.organizationId` on mutating operations for audit correlation.
3. **Mismatch forbidden** — If `organizationId` is set on actor metadata, it must equal the resolved `MemoryScope.organizationId` for that operation; otherwise treat as `FORBIDDEN`.
4. **Not a scope substitute** — `organizationId` on actor metadata is attribution/audit; enforcement still flows through `MemoryScope` + `IScopeResolver`.

**Example (Phase 10 enterprise actor):**

```typescript
const actor: ActorMetadata = {
  actorType: 'future_organization',
  actorId: 'idn_svc_billing',
  actorName: 'Billing Service',
  organizationId: 'org_acme_corp',
  timestamp: '2026-07-04T03:00:00.000Z',
};
```

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

## 17. Event Model

> **Successor (Phase 12 — landed 2026-07-04):** `IEventBus` consumers, audit fan-out (`memory.accessed`), domain topics. Default `EVENT_BUS_PROVIDER=none` — zero hot-path change. Contract below authored at Phase 7 gate; shapes align with Phase 12 implementation (ADR-020).

### Event contract (Phase 7 design → Phase 12 implementation)

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

Event subscriptions are scoped to `ownerId` in all phases through Phase 9. Organization-level subscription is deferred to Phase 10.

**Subscription scope matrix (P2):**

| Phase | Subscribe scope | Auth proof | Events delivered | Cross-scope |
|-------|-----------------|------------|------------------|-------------|
| 7–8 | `ownerId` only | API key or JWT with matching `ownerId` | `memory.*`, `context.*`, `relation.*` for that owner | Forbidden — 404 on mismatch |
| 9 | `ownerId` + optional `workspaceId` | JWT/API key + workspace membership when RBAC on | Above + `agent.*`, `workspace.*` filtered to workspace | Workspace A cannot subscribe to workspace B |
| 10 | `ownerId` + optional `workspaceId` + optional `organizationId` | JWT with `organization_id` + membership ([ADR-010](../../../docs/adr/010-workspace-membership-rbac.md)) | Above + `organization.*`, `audit.*` within org boundary | Org-level handlers receive only org-scoped events |

**Authorization rules:**

1. **Subscriber identity** — `subscribe()` requires the same credentials as REST/MCP; anonymous subscriptions are forbidden.
2. **Scope binding** — Each handler registration stores `{ ownerId, workspaceId?, organizationId? }`; the bus filters before delivery.
3. **No wildcard tenancy** — Patterns like `subscribe('*')` or cross-owner fan-out are forbidden.
4. **Audit-only** — Subscribers receive notifications; AI Brain does not execute agent logic in handlers (external consumers only).
5. **Phase 7** — Contract only; no bus implementation or live subscriptions.

```typescript
interface EventSubscriptionScope {
  ownerId: string;
  workspaceId?: string;       // Phase 9+
  organizationId?: string;    // Phase 10+
}

interface IEventBus {
  // Phase 10+ — not implemented in Phase 7
  publish(event: DomainEvent): Promise<void>;
  subscribe(
    eventType: string,
    scope: EventSubscriptionScope,
    handler: EventHandler,
  ): Promise<string>;  // returns handlerId
  unsubscribe(handlerId: string): Promise<void>;
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
| 6.5 | Complete | Progressive retrieval |
| 7 | Complete | Agent boundary (doc-only gate) |
| 7.5 | Complete | Capability manifest (ADR-025) |
| 8 | Complete | Knowledge graph |
| 9 | Complete | Multi-AI |
| 10 | Complete | Enterprise (opt-in adapters) |
| 12 | Complete | Event pipeline / async bus (ADR-020; opt-in `EVENT_BUS_PROVIDER`) |
| 13 | Complete | Protocol layer (streaming SSE/WS/gRPC) |
| 13.1 | Complete | Remote MCP (ADR-048) |
| 19 | Future | Full observability platform (Grafana/SLO — distinct from Phase 12 bus) |

> **Snapshot note:** Table updated post-gate (2026-07-05). Phase 7 gate (2026-07-03) listed Phase 12 as Future — D7-03 closed when Phase 12 landed (2026-07-04).

### Future migration policy

| Trigger | Migration path |
|---------|-----------------|
| Major version bump | 12-month deprecation window + migration guide |
| Schema evolution | Phased: add → backfill → index → deprecate |
| Contract break | Owner approval + ADR + migration |

---

## 19. Future Compatibility

> **Successor closure (2026-07-04):** Phases 7.5, 8, 9, and 10 landed without rewriting Phase 7 boundary contracts. Readiness tables below remain the **design rationale** at gate time; current agent surface is in §13 and [COMPLETION.md](COMPLETION.md) successor closure.

### Phase 8 — Knowledge Graph (landed)

Phase 7 design enabled Phase 8 integration without rewrites:

| Design element | Phase 8 impact | Outcome |
|---------------|----------------|---------|
| `MemoryScope` | Gains optional `workspaceId` | ADR-002 contract preserved |
| `IGraphProvider` | New port + adapter | Does not touch `MemoryService` |
| Relations | Flat edges remain stable | No `RelationsV2` |
| Retrieval | Graph source in composite | Same `IRetrievalCandidateSource` |

**Landed:** MCP `get_graph_capabilities`, `traverse_relations`; opt-in `GRAPH_RETRIEVAL` composite leg (Phase 6.5 relations stage).

### Phase 9 — Multi-AI (landed)

Phase 7 design enabled Phase 9 integration without rewrites:

| Design element | Phase 9 impact | Outcome |
|---------------|----------------|---------|
| `MemoryScope` | Gains `agentId`, `workspaceId` | Optional fields; `ownerId` unchanged |
| `IAgentIdentity` | New port | Does not touch core services |
| `ISyncManager` | New port | External orchestration; contract defined below |

**Landed:** `list_workspaces`, `list_agents`, `register_agent`; scope resolver with optional `agentId`.

### ISyncManager contract (Phase 9 — orchestration external)

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

### Phase 10 — Enterprise (landed, opt-in)

Phase 7 design enabled Phase 10 integration without rewrites:

| Design element | Phase 10 impact | Outcome |
|---------------|----------------|---------|
| `MemoryScope` | Gains `organizationId` | Optional field |
| Auth | Org-level RBAC | `IWorkspaceMembership` port |
| Audit | Event contracts defined | ✅ Phase 12 `IEventBus` + audit fan-out (opt-in) |
| Storage | Postgres adapter | Same ports; D1 adapter unchanged |

**Landed:** Org RBAC adapters (opt-in); JWT `organization_id`; actor rules §14.

### Phase 12 — Event pipeline (landed)

| Design element (D7-03) | Phase 12 outcome |
|------------------------|------------------|
| Event subscription contract §17 | ✅ Domain consumers via `IEventBus` (ADR-020) |
| `memory.created/updated/deleted/accessed` | ✅ MemoryService post-commit publishers |
| Agent-facing event API | ⏸ Not in Phase 7 scope — bus is internal/async |

**Partial follow-ups (outside Phase 7):** Phase 12C request metadata audit; `memory.signal.received` bridge (8.5 D85-02); Phase 19 OTel runbook.

### Phase 7.5 — Capability manifest (landed)

| Gap (D7-01) | Landed | Agent impact |
|-------------|--------|--------------|
| No runtime capability discovery | `get_capabilities` + REST manifest (ADR-025) | Agents read flags/limits without trial-and-error |

### Three-phase horizon guarantee (gate-time — validated post-gate)

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

### Constitution principles checklist (P1)

Mapped to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md):

| Principle group | Rule | Phase 7 evidence |
|-----------------|------|------------------|
| Philosophy | System not snapshot; capability stack | §19 three-phase horizon |
| Philosophy | Boundary discipline; replaceability | §7 inside/outside; §11–§12 ports |
| Architecture | Inward dependencies; layer separation | §4 layer diagram |
| Architecture | Single canonical owner; composition root | §3 architecture; no duplicate services |
| SOLID | SRP, OCP, LSP, ISP, DIP | Ports per ADR-004; additive contracts §18 |
| Compatibility | Stable public surface; additive first | §11 tool schema rules; §18 versioning |
| Extensibility | Port before implementation; extension over rewrite | §19 future ports |
| Multi-tenancy | Scope by identity; isolation default | §16 `MemoryScope`; 404 cross-scope |
| Multi-tenancy | Future-ready scope contract | §16 optional `organizationId`, `workspaceId`, `agentId` |
| AI-first | Protocol-native access; context efficiency | §11 MCP; §5 context budget |
| Maintainability | Document hierarchy; evidence-based completion | This DESIGN + CHECKLIST gate |

### ADR compliance checklist (P1)

| ADR | Status | Phase 7 evidence |
|-----|--------|------------------|
| [ADR-001](../../../docs/adr/001-multi-source-retrieval.md) | Implemented | `CompositeRetrievalCandidateSource` §3 |
| [ADR-002](../../../docs/adr/002-workspace-identity-model.md) | Implemented | `MemoryScope` §16; actor `organizationId` §14 |
| [ADR-003](../../../docs/adr/003-embedding-storage-mvp.md) | Implemented | `IEmbeddingStore` §19 |
| [ADR-004](../../../docs/adr/004-repository-port-types.md) | Implemented | Repository ports §11–§12 |
| [ADR-005](../../../docs/adr/005-content-object-store.md) | Implemented | Future blob offload §19 |
| [ADR-007](../../../docs/adr/007-multi-ai-workspace-scope.md) | Implemented | `workspaceId` / `agentId` optional §16 |
| [ADR-010](../../../docs/adr/010-workspace-membership-rbac.md) | Implemented | Org scope + event subscription §17 |

### Section deliverables checklist (23 sections)

- [x] §1 Purpose · §2 Scope · §3 Architecture · §4–§6 Boundaries & forbidden patterns
- [x] §7 Inside/outside table · §8 Protocol versioning · §9 Capability negotiation
- [x] §10 Capability manifest · §11 MCP tools · §12 REST API · §13 Compatibility matrix
- [x] §14 Actor model · §15 Session model · §16 Integration patterns · §17 Event model
- [x] §18 Deprecation policy · §19 Future compatibility · §20 Constitution compliance
- [x] §21 Success criteria · §22 Risks · §23 References

---

## 21. Success Criteria

### Phase 7 success criteria

| Criterion | Verification | Evidence |
|-----------|--------------|----------|
| Protocol defined | Stable contracts documented | This document |
| MCP contracts stable | 22 tools (SSOT `MCP_TOOL_NAMES`) | Section 11 + addendum §13 |
| REST contracts stable | Endpoints documented | Section 12 |
| Compatibility matrix | 9 agent clients mapped | Section 13 |
| Actor model defined | 9 actor types defined | Section 14 |
| Session model defined | 4 memory levels defined | Section 15 |
| Event model reserved | Future contract documented | Section 17 |
| Future compatibility | Successor phases 7.5–10 landed | Section 19 + §13 |
| Constitution compliance | 17 checklist items + 23 section deliverables | Section 20 |

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
| Event bus performance at scale | 12 | ✅ Implemented opt-in; tune `EVENT_BUS_PROVIDER` in prod |
| Workspace isolation performance | 9 | Query patterns defined; index strategy deferred |
| Graph traversal at scale | 8 | Port defined; D1 CTE vs external engine deferred |

---

## 23. References

### Governance documents

| Document | Relevance |
|----------|-----------|
| [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) | Immutable law; boundary rules |
| [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) | Layer boundaries; ports |
| [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) | Phase 7 scope |
| [GLOSSARY.md](../../glossary/GLOSSARY.md) | Canonical terms |

### ADRs

| ADR | Title | Phase 7 relevance |
|-----|-------|-------------------|
| [ADR-001](../../../docs/adr/001-multi-source-retrieval.md) | Multi-source retrieval | Enables richer context |
| [ADR-002](../../../docs/adr/002-workspace-identity-model.md) | Workspace identity | Scope contract for Phase 9+ |
| [ADR-003](../../../docs/adr/003-embedding-storage-mvp.md) | Embedding storage | Vector retrieval foundation |
| [ADR-004](../../../docs/adr/004-repository-port-types.md) | Repository ports | Storage abstraction |
| [ADR-005](../../../docs/adr/005-content-object-store.md) | Content store | Future blob offload |
| [ADR-007](../../../docs/adr/007-multi-ai-workspace-scope.md) | Multi-AI workspace scope | Phase 9 `workspaceId` / `agentId` |
| [ADR-010](../../../docs/adr/010-workspace-membership-rbac.md) | Workspace membership RBAC | Phase 10 org scope + events |

### Phase documents

| Phase | Document | Phase 7 relation |
|-------|----------|-----------------|
| 6 | [06-hybrid-retrieval/DESIGN.md](../06-hybrid-retrieval/DESIGN.md) | Hybrid retrieval enables richer context |
| 8 | [08-knowledge-graph/DESIGN.md](../08-knowledge-graph/DESIGN.md) | Graph-augmented retrieval; `IGraphProvider` §19 |
| 9 | [09-multi-ai/DESIGN.md](../09-multi-ai/DESIGN.md) | Workspace scope, `agentId`, `ISyncManager` §19 |
| 9.5 | [09.5-platform-architecture/DESIGN.md](../09.5-platform-architecture/DESIGN.md) | Platform ports that extend agent boundary |
| 10 | [10-enterprise/DESIGN.md](../10-enterprise/DESIGN.md) | `organizationId`, RBAC, event bus §17 |
| 11 | [11-production-ops/DESIGN.md](../11-production-ops/DESIGN.md) | Postgres cutover, ops — no agent logic |

Roadmap index: [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) · Phase status: [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md)

### External references

| Reference | Relevance |
|-----------|-----------|
| MCP Protocol Specification | Tool definition standard |
| JSON-RPC 2.0 Specification | MCP transport format |
| REST API Design Best Practices | Endpoint conventions |
| Clean Architecture (Robert C. Martin) | Layer principles |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md). Do not contradict Approved ADRs.*
