# AI Brain Constitution

> **Alias:** `ARCHITECT_RULES.md` — same document; use either name in prompts.

**Status:** Immutable project constitution.  
**Audience:** All implementers — Cursor, Codex, Claude Code, ChatGPT, CI agents, or any future agent.

---

## How to use this document

**Every implementation prompt must begin with:**

```
Read docs/AI_BRAIN_CONSTITUTION.md first. Treat it as immutable project constitution.
```

Then add phase-specific requirements (design approval, commits, tests, etc.).

Agents must read this file **before** writing code. If a task conflicts with this constitution, **stop and ask** — do not improvise a parallel architecture.

**Amendments:** Only the project owner may change this file. Agents must not weaken, bypass, or duplicate these rules elsewhere.

---

## 1. Long-term vision

This repository is **one component** of **AI Brain**, not the whole system.

```
Memory Layer
    ↓
Knowledge Layer
    ↓
Embedding Layer
    ↓
Vector Layer
    ↓
Graph Layer
    ↓
Reasoning Layer
    ↓
Planning Layer
    ↓
Execution Layer
    ↓
Multi-Agent Layer
```

**Rule:** Every implementation must move toward this stack.  
**Never** optimize only for the current phase (e.g. D1-only shortcuts that block Postgres, R2, or vector search later).

Operational detail and current repo mapping: [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 2. Repo scope today

| Layer | In this repo | Extend / swap via |
|-------|--------------|-------------------|
| Memory | ✅ CRUD, retrieval, context, consolidation | `IMemoryRepository`, `memory/` |
| Knowledge | ✅ Metadata, relations, codenames, levels | `KnowledgeService`, `types/knowledge.ts` |
| Embedding | 🔲 Reserved (`embedding_id`, `object_key`) | Future `IEmbeddingProvider` |
| Vector | 🔲 | `Retriever` via ports; no SQL-only lock-in |
| Graph | 🔲 Flat relations today | `MemoryRelationRepository` → graph adapter later |
| Reasoning → Multi-Agent | 🔲 | MCP + REST as boundary; logic stays outside this repo |

---

## 3. Architecture guard rails

### Never duplicate

Extend the **canonical module** instead of copying logic:

| Concern | Canonical owner | Extend via |
|---------|-----------------|------------|
| Memory metadata / enrichment | `KnowledgeService` + `types/knowledge.ts` | Schemas; `enrichForCreate` / `enrichForUpdate` |
| Persistence | `MemoryRepository` (`IMemoryRepository`) | New interface methods + one D1 impl |
| CRUD / backup | `MemoryService` | New methods on existing class |
| REST search (paginated) | `SearchService` + `findSearchCandidates` | `SearchFilters`; caps in config |
| Relevance scoring | `search/ranking.engine.ts` | Weights in `search/ranking.config.ts` only |
| LLM retrieval pipeline | `memory/Retriever` → `Ranker` → `ContextService` | New steps in `memory/`; reuse `rankMemories` |
| Input validation | `types/*.ts` (Zod) | Co-locate with domain; routes use `preValidation` only |

### Never create

- `MemoryServiceV2`, `SearchService2`
- `KnowledgeManager`, `MemoryManager`
- `UniversalRepository`
- `utils/` modules containing **business logic** (`utils/` = mappers, `formatWIB`, response shaping only)

### Never duplicate (summary)

- metadata  
- repositories  
- services  
- search logic  
- ranking logic  
- validation  

### New abstractions

Each must have **one clear responsibility** and a reason it cannot live in an existing module.

Prefer:

- **Interface** (`IMemoryRepository`) over a second repository class  
- **Pure functions** (`semantic-hash.ts`, `knowledge/*` generators) over new services  
- **Orchestrator** (`ContextService`) composing existing pieces over reimplementing search/rank  

---

## 4. Layer boundaries (this repo)

```
routes/       → validation, rate limits — no business logic, no SQL
controllers/  → call services, HTTP status, WIB display — no SQL, no auth logic
services/     → orchestration — no request/reply, no direct SQL
repositories/ → SQL / D1 only — no HTTP, no auth decisions
knowledge/    → pure generators + KnowledgeService — no HTTP, no SQL
memory/       → retrieval, context, consolidation — no direct SQL
search/       → RankingEngine (pure) + SearchService
auth/         → identity, permissions — via AuthService, not raw DB in middleware
```

Stack entrypoints:

- **REST:** `routes/` → `controllers/` → `services/` | `memory/` → `repositories/`  
- **MCP:** `mcp/server.ts` → same services — **never** duplicate business logic in tool handlers  

---

## 5. Extensibility principles

1. **Repository is the storage swap point** — Postgres, R2, vector DB replace impl; services above stay unchanged.  
2. **Retriever / Ranker / ContextBuilder stay storage-agnostic** — depend on interfaces and pure functions.  
3. **Reserve columns; avoid breaking schema** — `embedding_id`, `object_key`, `semantic_hash` are forward-compatible.  
4. **MCP and REST are outward boundaries** — no agent reasoning, planning, or execution logic inside this repo.  
5. **Configs must survive the next layer** — caps and weights in `ranking.config.ts` / `context.config.ts`, not hard-coded for D1-only paths.  

**PR checklist:** Which layer advances? Which port/interface enables the next layer without a rewrite?

---

## 6. Implementation discipline

When implementing features (any phase):

| Rule | Requirement |
|------|-------------|
| Commits | Small; **one concern per commit** |
| Scope | **No** architectural changes outside approved design |
| Scope | **No** unrelated refactors or formatting |
| Quality gate | After each commit: `lint` → `typecheck` → `test` — **stop if any fails** |
| Tests | Never skip; never mark complete until all tests pass |
| MCP changes | Additive tools preferred; do not break existing tool contracts without approval |
| Migrations | Phased (add columns → backfill → indexes); no destructive deletes of user data |
| Consolidation | Archive only; **never hard-delete** memories |

---

## 7. Canonical patterns (do not fork)

| Pattern | Rule |
|---------|------|
| Class name | Keep `MemoryRepository` (interface: `IMemoryRepository`) |
| Search vs retrieval | `SearchService` = REST paginated search; `Retriever` = bounded LLM candidate fetch |
| Context budget | Default 12k chars; max 24k — see `context.config.ts` |
| Levels | MCP `save_memory` → `note`; import/sync → `raw` |
| Permissions | `memory.read` / `memory.write`; context endpoints use `memory.read` |
| Timestamps | UTC in DB; WIB display in REST only via `formatWIB()` |

---

## 8. Related documents

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Current system diagram, deployment, phase status |
| [PANDUAN.md](PANDUAN.md) | User guide — setup, usage, MCP |
| [archive/](archive/) | Phase design docs (historical) |

**Hierarchy:** `AI_BRAIN_CONSTITUTION.md` → phase design doc → task prompt.

---

*Last updated: Phase 4 complete. Amend only with explicit owner approval.*
