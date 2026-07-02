# Phase 4 — Memory Intelligence Layer (Design)

**Status:** 📋 Design — pending approval  
**Prasyarat:** Phase 2.6 Knowledge Foundation complete (`c5c4f30`)  
**Storage:** Cloudflare D1 only (no PostgreSQL, R2, vector DB in this phase)  
**Goal:** Scalable retrieval + consolidation pipeline with repository portability for future Postgres / object storage / vector search

---

## 1. Executive Summary

Phase 4 adds an **intelligent memory pipeline** on top of the existing `memories` table and Phase 2.6 knowledge metadata. The system **never loads all memories** into an LLM context. Instead it:

1. **Retrieves** a bounded candidate set from D1 (SQL filters + cap)
2. **Ranks** candidates by relevance, importance, recency, and access patterns
3. **Builds** a token-efficient context block for the model
4. **Consolidates** duplicates and stale entries in a background job (archive, never hard-delete)

All SQL stays in **Repository** implementations behind interfaces. Services (`Retriever`, `Ranker`, `ContextBuilder`, `PromptBuilder`, `MemoryConsolidator`) contain business logic only.

---

## 2. Relationship to Existing Codebase

| User requirement | Already exists (Phase 2.6) | Phase 4 action |
|------------------|---------------------------|----------------|
| Memory Repository | `MemoryRepository` (concrete D1 class) | Extract **`IMemoryRepository` interface**; D1 impl renames to `D1MemoryRepository` |
| Memory Service | `MemoryService` + `KnowledgeService` | Keep; add thin **`MemoryOrchestrator`** or extend service for retrieval API |
| Ranker | `RankingEngine` (`scoreMemory`, `rankMemories`) | Extend with **recency + access + level** weights; rename module **`Ranker`** (wraps engine) |
| Retriever | `SearchService` + `findSearchCandidates` (cap 500) | New **`Retriever`** — explicit retrieval contract, lower default cap for LLM |
| Context Builder | — | **New** — token-budget assembly |
| Prompt Builder | — | **New** — system + context + user template |
| Memory Consolidator | — | **New** — `scripts/consolidate-memories.ts` + service |

**Out of scope Phase 4:** embeddings, pgvector, R2/MinIO, semantic vector search (columns reserved only).

---

## 3. Architecture

```
                    ┌─────────────────────────────────────────┐
                    │  Entry points                            │
                    │  REST /api/v1/context  MCP get_context   │
                    └────────────────────┬────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │  MemoryService (existing CRUD)           │
                    └────────────────────┬────────────────────┘
                                         │
     ┌───────────────────────────────────┼───────────────────────────────────┐
     │           memory/ (Phase 4)         │                                   │
     │                                   │                                   │
     │  Retriever ──► IMemoryRepository  │  (SQL only inside D1 impl)        │
     │      │                            │                                   │
     │      ▼                            │                                   │
     │  Ranker ◄── ranking.engine        │  (pure scoring)                   │
     │      │                            │                                   │
     │      ▼                            │                                   │
     │  ContextBuilder                   │  (token budget)                   │
     │      │                            │                                   │
     │      ▼                            │                                   │
     │  PromptBuilder                    │  (final prompt string)            │
     │                                   │                                   │
     │  MemoryConsolidator ──► repo      │  (batch job, no HTTP)             │
     └───────────────────────────────────┴───────────────────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │  D1MemoryRepository                    │
                    │  (only component that knows D1 SQL)      │
                    └────────────────────┬────────────────────┘
                                         ▼
                              Cloudflare D1
```

### Dependency rules (unchanged from Phase 2.6)

| Layer | May depend on | Must NOT |
|-------|---------------|----------|
| `routes/` / `controllers/` | services | SQL, ranking weights |
| `memory/*` services | repository **interfaces**, pure modules | SQL, HTTP |
| `repositories/` | `D1Client` | business rules |
| `RankingEngine` | types only | DB, HTTP |

---

## 4. Schema — Single Table `memories` (Extended)

Phase 4 is **additive**. Existing columns from Phase 2.6 remain. New columns support retrieval, consolidation, and future storage/vector phases.

### 4.1 Core columns (user spec + mapping)

| Column | Type | Phase 4 | Notes |
|--------|------|---------|-------|
| `id` | TEXT PK UUID | ✅ exists | |
| `project_id` | TEXT NOT NULL DEFAULT '' | **ADD** | Normalized project key (slug). Maps 1:1 from existing `project` during backfill |
| `level` | TEXT NOT NULL DEFAULT 'note' | **ADD** | See §4.2 |
| `title` | TEXT | ✅ exists | |
| `content` | TEXT | ✅ exists | Full markdown body |
| `summary` | TEXT | ✅ exists | Short summary (≤300 API) |
| `tags` | TEXT JSON array | ✅ exists | |
| `importance` | INTEGER 0–100 | ✅ exists | |
| `created_at` | TEXT ISO-8601 UTC | ✅ exists | Display WIB at API layer optional |
| `updated_at` | TEXT ISO-8601 UTC | ✅ exists | |
| `last_accessed` | TEXT nullable | **ADD** | Updated on successful retrieval |
| `access_count` | INTEGER DEFAULT 0 | **ADD** | Incremented on retrieval |

### 4.2 Memory levels

```typescript
type MemoryLevel = 'raw' | 'note' | 'summary' | 'canonical';
```

| Level | Purpose | Consolidator behavior |
|-------|---------|----------------------|
| `raw` | Chat import chunks, auto-sync | Candidate for merge → `summary` |
| `note` | Default user/MCP saves | Default create level |
| `summary` | Consolidated handoff / merged | Promoted from `raw` duplicates |
| `canonical` | Single source of truth per topic | Rare; high importance |

**Retriever default:** prefer `canonical` > `summary` > `note` > `raw` (level boost in Ranker).

### 4.3 Future-ready columns (nullable, unused in Phase 4 logic)

| Column | Type | Future use |
|--------|------|------------|
| `embedding_id` | TEXT NULL | Phase 5 — vector store foreign key |
| `object_key` | TEXT NULL | Phase 5+ — R2/S3 large blob pointer |
| `semantic_hash` | TEXT NULL | Phase 4 consolidator — duplicate detection without vectors |

### 4.4 Preserved Phase 2.6 columns (do not remove)

`owner_id`, `project` (denormalized display name), `codename`, `slug`, `keywords`, `category`, `memory_type`, `language`, `notes`, `favorite`, `archived`

**Rule:** `project_id` = `slugify(project)` at write time. Both columns kept for backward compatibility until Phase 5.

### 4.5 Indexes (M4 migration)

```sql
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(owner_id, project_id);
CREATE INDEX IF NOT EXISTS idx_memories_level ON memories(level);
CREATE INDEX IF NOT EXISTS idx_memories_last_accessed ON memories(last_accessed);
CREATE INDEX IF NOT EXISTS idx_memories_retrieval
  ON memories(owner_id, project_id, archived, importance DESC, updated_at DESC);
```

---

## 5. Repository Interface (Portability Contract)

Only the D1 (later Postgres) adapter implements SQL. All other components depend on this interface.

```typescript
// src/repositories/memory.repository.interface.ts

export interface RetrievalFilters {
  ownerId: string;
  projectId?: string;
  tags?: string[];
  levels?: MemoryLevel[];
  query?: string;
  importanceMin?: number;
  archived?: boolean;
  maxCandidates: number; // hard cap — never unbounded
}

export interface IMemoryRepository {
  insert(data: InsertMemoryData): Promise<Memory>;
  update(id: string, data: UpdateMemoryData, ownerId: string): Promise<Memory | null>;
  findById(id: string, ownerId: string): Promise<Memory | null>;
  findRetrievalCandidates(filters: RetrievalFilters): Promise<Memory[]>;
  recordAccess(id: string, ownerId: string): Promise<void>;
  findDuplicatesBySemanticHash(hash: string, ownerId: string, projectId?: string): Promise<Memory[]>;
  findStaleCandidates(ownerId: string, olderThan: string, limit: number): Promise<Memory[]>;
  archive(id: string, ownerId: string): Promise<void>;
  // existing list/search methods remain on D1MemoryRepository
}
```

**Postgres migration path:** implement `PostgresMemoryRepository implements IMemoryRepository` with identical method signatures; swap in DI wiring. Business logic unchanged.

---

## 6. Components

### 6.1 Retriever

**Responsibility:** Fetch **only** relevant candidates — never `SELECT *` without `LIMIT`.

```typescript
// src/memory/retriever.ts

export interface RetrievalRequest {
  scope: MemoryScope;
  projectId?: string;
  query?: string;
  tags?: string[];
  levels?: MemoryLevel[];
  limit?: number; // default 20, max 50
}

export class Retriever {
  constructor(private readonly repo: IMemoryRepository) {}

  async retrieve(req: RetrievalRequest): Promise<Memory[]> {
    const candidates = await this.repo.findRetrievalCandidates({
      ownerId: req.scope.ownerId,
      projectId: req.projectId,
      query: req.query,
      tags: req.tags,
      levels: req.levels,
      importanceMin: 0,
      archived: false,
      maxCandidates: Math.min(req.limit ?? 20, 50) * 3, // over-fetch for ranker
    });
    return candidates;
  }
}
```

**SQL strategy (D1):** reuse `findSearchCandidates` pattern — `WHERE owner_id = ? AND archived = 0` + optional `project_id`, `level`, `tags LIKE`, text `LIKE` on title/summary/keywords, `ORDER BY importance DESC, updated_at DESC`, `LIMIT :maxCandidates`.

---

### 6.2 Ranker

**Responsibility:** Score and sort candidates. Pure + testable.

Extends existing `RankingEngine` weights:

```typescript
// ranking.config.ts additions
export const RETRIEVAL_WEIGHTS = {
  ...RANKING_WEIGHTS,
  levelCanonical: 30,
  levelSummary: 20,
  levelNote: 10,
  levelRaw: 0,
  recencyDays7: 15,
  recencyDays30: 8,
  accessCountLog: 5, // log1p(access_count) * weight
} as const;
```

```typescript
export class Ranker {
  rank(memories: Memory[], query: SearchQueryContext): ScoredMemory[] {
    return rankMemories(memories, query).map(applyLevelAndRecencyBoost);
  }
}
```

Return **top-K only** (default K=10).

---

### 6.3 Context Builder

**Responsibility:** Turn ranked memories into a **compact markdown context** under a token/character budget.

```typescript
export interface ContextBuildOptions {
  maxChars?: number;      // default 12_000 (~3k tokens)
  includeSummaryOnly?: boolean; // if over budget, drop content body
  format?: 'markdown' | 'xml';
}

export class ContextBuilder {
  build(memories: ScoredMemory[], options?: ContextBuildOptions): string;
}
```

**Output shape (markdown):**

```markdown
## Relevant Memory Context

### [NOTE-0042] Handoff: MangroveApps Hydration (importance: 85)
> summary line...
<content truncated if needed>

### [ARCH-0012] Document Engine FSD
...
```

**Token discipline:** always include `codename`, `title`, `summary`; include `content` only until budget exhausted; never dump full archive.

---

### 6.4 Prompt Builder

**Responsibility:** Compose final LLM prompt from context + user task.

```typescript
export interface PromptBuildInput {
  systemRole?: string;
  contextBlock: string;
  userTask: string;
  projectId?: string;
}

export class PromptBuilder {
  build(input: PromptBuildInput): { system: string; user: string };
}
```

Default system prompt emphasizes: use context as ground truth, cite codenames, say when memory is insufficient.

**Not stored in DB** — runtime only. Optional audit log event `context.built` with memory IDs used.

---

### 6.5 Memory Consolidator

**Responsibility:** Background hygiene. **Never hard-delete.**

```typescript
export class MemoryConsolidator {
  async run(scope: MemoryScope, options: ConsolidationOptions): Promise<ConsolidationReport>;
}
```

| Step | Action |
|------|--------|
| 1. Duplicate detection | Same `project_id` + similar title (normalized) OR same `semantic_hash` |
| 2. Merge | Create new `summary` memory; link via `memory_relations` (`duplicate` → `canonical`) |
| 3. Archive sources | Set `archived = 1` on merged `raw`/`note` duplicates |
| 4. Stale promotion | Old high-access `note` → bump `importance` |
| 5. Summary generation | Optional: use `summary.generator` (rule-based Phase 4; LLM Phase 5) |

**semantic_hash (Phase 4):** `sha256(normalize(title + summary + first_500_chars(content)))` — no embedding required.

**Execution:**

```bash
npm run consolidate:memories [--dry-run] [--project MangroveApps]
```

Vercel: Cron trigger weekly. Local: manual or `sync:backups:poll`-style scheduler.

---

## 7. Retrieval Pipeline (End-to-End)

```
User/MCP: "Lanjut kerja MangroveApps hydration"
        │
        ▼
Retriever.retrieve({ projectId: 'mangroveapps', query: 'hydration', limit: 20 })
        │  SQL LIMIT 60 candidates max
        ▼
Ranker.rank(candidates, { q: 'hydration' })
        │  top 10 by score
        ▼
ContextBuilder.build(top10, { maxChars: 12000 })
        │
        ▼
PromptBuilder.build({ contextBlock, userTask })
        │
        ▼
Return to MCP tool `get_context` or REST POST /api/v1/context
        │
        └── Retriever triggers recordAccess() on included memory IDs
```

**Hard limits:**

| Parameter | Default | Max |
|-----------|---------|-----|
| SQL candidate cap | 60 | 100 |
| Ranked results | 10 | 20 |
| Context chars | 12,000 | 24,000 |

---

## 8. API & MCP Surface (Phase 4)

### REST (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/context` | Build context + prompt for task |
| POST | `/api/v1/memories/:id/access` | Manual access ping (optional) |

### MCP tools (additive)

| Tool | Description |
|------|-------------|
| `get_context` | retrieve → rank → build → return markdown context |
| `build_prompt` | full system+user prompt for external LLM |

Existing `search_memory` unchanged — `get_context` is the **opinionated, token-safe** path.

---

## 9. Future Compatibility Matrix

| Concern | Phase 4 (D1) | Phase 5+ (Postgres / R2 / Vector) |
|---------|--------------|-----------------------------------|
| CRUD | `D1MemoryRepository` | `PostgresMemoryRepository` |
| Large content | `content` TEXT in D1 | `object_key` → R2; summary in row |
| Duplicate detection | `semantic_hash` | same + embedding cosine |
| Retrieval | SQL LIKE + rank | hybrid: vector top-K + SQL filters |
| Consolidator | script + D1 | same service, different repo |
| Migrations | `migrations.ts` | Prisma/Drizzle parallel |

**Repository is the only swap point.** `Retriever`, `Ranker`, `ContextBuilder`, `PromptBuilder`, `MemoryConsolidator` remain unchanged.

---

## 10. Migration Plan (3-Phase, like 2.6)

| Phase | Migration | Description |
|-------|-----------|-------------|
| **M4a** | ADD columns | `project_id`, `level`, `last_accessed`, `access_count`, `embedding_id`, `object_key`, `semantic_hash` |
| **M4b** | Backfill script | `npm run db:backfill-memory-intelligence` — project_id from project, level=`note`, hashes |
| **M4c** | Indexes | retrieval indexes after backfill |

No UNIQUE constraint changes. No table splits.

---

## 11. Implementation Commits (Proposed)

| # | Commit | Deliverable |
|---|--------|-------------|
| 1 | `feat(memory): add IMemoryRepository + M4a schema` | Interface + migration + types |
| 2 | `feat(memory): implement Retriever and extended Ranker` | retrieval caps + tests |
| 3 | `feat(memory): ContextBuilder and PromptBuilder` | token budget tests |
| 4 | `feat(memory): MemoryConsolidator + consolidate script` | dry-run + archive-only |
| 5 | `feat(api): POST /context and MCP get_context` | E2E tests |
| 6 | `chore(memory): backfill M4b + docs` | ARCHITECTURE.md update |

**Quality gate per commit:** lint, format, typecheck, tests PASS. Target ≥80 tests.

---

## 12. Decisions Log (Pre-approval)

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Keep single `memories` table | User spec; Phase 2.6 W3 (no memory_index) |
| D2 | `project_id` additive alongside `project` | Backward compatible REST/MCP |
| D3 | Archive never delete | User requirement; `archived=1` |
| D4 | UTC storage, WIB display optional | Existing `nowISO()` pattern |
| D5 | No vector search in Phase 4 | Constraint; columns reserved |
| D6 | `semantic_hash` for dedup before embeddings | Low cost on D1 |
| D7 | Consolidator as npm script not daemon | Vercel serverless compatible |

---

## 13. Open Questions (for approval)

1. **Default context budget:** 12k chars OK for Cursor/Claude?
2. **Level on create:** MCP `save_memory` default `note`; import/sync → `raw`?
3. **Consolidator auto-run:** weekly Cron on Vercel or manual only?
4. **Phase number:** slot as **Phase 4** (this doc) vs rename Auth to Phase 3.5?

---

## 14. Definition of Done

- [ ] `IMemoryRepository` + D1 impl; no SQL outside repository
- [ ] Retriever never unbounded query
- [ ] Ranker returns top-K with level + recency + importance
- [ ] ContextBuilder respects char budget
- [ ] Consolidator merges duplicates, archives, never deletes
- [ ] M4a/b/c migrations + backfill
- [ ] MCP `get_context` + REST `/context`
- [ ] ≥80 tests including retrieval cap + consolidation dry-run
- [ ] `docs/ARCHITECTURE.md` updated

---

**Next step:** Review §13 open questions → approve → implement commit 1.
