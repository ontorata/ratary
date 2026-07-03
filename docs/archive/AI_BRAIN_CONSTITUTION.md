# AI Brain Constitution

> **Alias:** `ARCHITECT_RULES.md` — same document.

**Status:** Immutable. **Only the project owner may amend.**

---

## How to use

**Every implementation session must begin with:**

```
Read .ai/core/constitution/INDEX.md first — mandatory entry point.
Follow the reading order in INDEX.md before writing code.
Read .ai/TASK_PROMPT.md for the current task only.
```

If work conflicts with this constitution → **stop and ask**. Do not improvise a parallel architecture.

**Current work lives in [TASK_PROMPT.md](TASK_PROMPT.md)** — not in this file.

---

## 1. Vision

This repo is **one component** of AI Brain:

```
Memory → Knowledge → Embedding → Vector → Graph → Reasoning → Planning → Execution → Multi-Agent
```

**Rule:** Every change must advance toward this stack.  
**Never** optimize only for the current phase or current storage (D1-only shortcuts that block Postgres, R2, vector DB, graph DB).

**Design for at least the next three phases.** If a change would require rewrite in a later phase → **ADR first**, no code.

---

## 2. Fixed dependency direction

```
routes → controllers → services | memory/ | knowledge/ | search/ | auth/
                              → repositories → storage adapters
MCP → mcp/server.ts → same services (never duplicate business logic in tools)
```

**Never reverse this direction.**  
**Never bypass layers** (no SQL in services, no HTTP in repositories, no business logic in routes).

---

## 3. Layer rules (non-negotiable)

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| `routes/` | Validation, rate limits | SQL, business logic |
| `controllers/` | Parse request, call service, HTTP response | SQL, repository, auth logic |
| `services/` | Orchestration, business rules | `request`/`reply`, SQL |
| `repositories/` | SQL / storage only | Business logic, HTTP, auth decisions |
| `knowledge/` | Pure generators + `KnowledgeService` | SQL, HTTP |
| `search/` | `RankingEngine` (pure) + `SearchService` | Repository, HTTP, D1 |
| `memory/` | Retrieval, rank, context, prompt, consolidation | SQL |
| `auth/` | Identity, permissions via services | Raw DB in middleware |

---

## 4. Never duplicate

Extend the **canonical module** — do not copy logic.

| Concern | Owner |
|---------|--------|
| Memory metadata | `KnowledgeService` + `types/knowledge.ts` |
| Persistence | `IMemoryRepository` (+ reader/writer ports) |
| CRUD / backup | `MemoryService` |
| REST search | `SearchService` + `findSearchCandidates` |
| Relevance scoring | `search/ranking.engine.ts` + `ranking.config.ts` |
| LLM retrieval | `memory/Retriever` → `Ranker` → `ContextService` |
| Validation | `types/*.ts` (Zod) |

---

## 5. Never create

- `*V2` classes (`MemoryServiceV2`, `RetrieverV2`, …)
- `KnowledgeManager`, `MemoryManager`, `UniversalRepository`
- Placeholders, stubs, `TODO`, `FIXME`, dead code for future phases
- Business logic in `utils/` (mappers and `formatWIB` only)
- Agent reasoning, planning, or execution logic **inside this repo**

---

## 6. Storage & ports

- **Repository is the metadata SQL swap point** — not the only port for all storage.
- **Never write SQL outside repositories.**
- **Embedding** → `IEmbeddingProvider` — **not** inside repository.
- **Vectors** → `IEmbeddingStore` + `IRetrievalCandidateSource` — **not** vector SQL in `MemoryRepository`.
- **Large content** → `IContentStore` (future) — not coupled to D1 row shape in services.
- **Graph** → extend via `IGraphProvider` — **do not replace** `MemoryRelationRepository` with a V2 class.
- Infrastructure adapters (D1, Postgres, R2, S3, Qdrant, Weaviate, pgvector) must be **replaceable** without rewriting `MemoryService`, `KnowledgeService`, or `SearchService`.

---

## 7. Search (fixed)

```
Repository → SearchService → RankingEngine (pure)
```

`RankingEngine` **must not** access repositories, D1, or HTTP.

---

## 8. Backward compatibility

- **Never remove** public fields or break MCP tool contracts without owner approval.
- **Never rename** public REST/MCP APIs without approval.
- **Prefer additive** schema (`ALTER`, new columns, new ports).
- Migrations: idempotent, phased (add → backfill → indexes), **no destructive delete** of user memories (archive only).

---

## 9. Architecture decisions

- **Every structural change requires an approved ADR** — [ADR-POLICY.md](ADR-POLICY.md).
- Agents must not weaken or duplicate these rules in other files.

---

## 10. Implementation discipline

| Rule | Requirement |
|------|-------------|
| Commits | Small; **one concern per commit** |
| Scope | No architecture outside approved ADR + [TASK_PROMPT.md](TASK_PROMPT.md) |
| Quality gate | `lint` → `format:check` → `typecheck` → `test` — stop on failure |
| Tests | No decrease in coverage; never skip |
| MCP | Additive tools preferred |
| Long-term | Evaluate compatibility with Phases 5–10 before coding |

---

## 11. Canonical patterns

| Pattern | Rule |
|---------|------|
| Class name | `MemoryRepository` implements `IMemoryRepository` |
| Search vs retrieval | `SearchService` = paginated REST; `Retriever` = bounded LLM candidates |
| Context budget | Config in `context.config.ts` |
| Permissions | `memory.read` / `memory.write`; context = `memory.read` |
| Timestamps | UTC in DB; WIB in REST display only |

---

## 12. Document hierarchy

```
AI_BRAIN_CONSTITUTION.md   ← immutable rules (this file)
ARCHITECTURE.md            ← structure, layers, extension points
ENGINEERING.md             ← Principal Engineer process & pre-code analysis
TASK_PROMPT.md             ← current phase work (see TASK_PROMPT.template.md)
ADR-POLICY.md → docs/adr/  ← structural decisions
archive/                   ← historical phase designs
PANDUAN.md                 ← user guide
```

---

*Amend only with explicit project owner approval.*
