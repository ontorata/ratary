# Phase 5 — Embedding Layer (Design)

**Status:** 📋 Design — awaiting approval before implementation  
**Prasyarat:** Phase 4 ✅ · Architecture milestones A–G ✅  
**Storage:** Cloudflare D1 (metadata) + external embedding store (Phase 5)  
**Konstitusi:** [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) — immutable

---

## 1. Executive Summary

Phase 5 adds an **Embedding Layer** between Knowledge and Vector retrieval. Memories keep a lightweight `embedding_id` pointer on the `memories` row; vectors live in a dedicated store behind ports.

**Goals:**

1. Generate and persist embeddings for memory text (title + summary + content excerpt) **asynchronously**
2. Expose `IEmbeddingProvider` so models/vendors can be swapped (OpenAI, local, Cloudflare Workers AI)
3. Wire `embedding_id` on `memories` without blocking CRUD or MCP/REST contracts
4. Prepare **Phase 6 Hybrid RAG** via existing `IRetrievalCandidateSource` (vector source plugs in next)

**Non-goals (Phase 5):**

- Hybrid fusion ranking (Phase 6)
- Vector-only retrieval replacing SQL (Phase 6)
- Content offload to R2 (`object_key` / `IContentStore`) — Phase 5b or parallel track
- Real-time embed-on-every-read
- New MCP tools (additive only if needed later)

---

## 2. Relationship to Current Architecture

Post–milestone G stack:

```
REST / MCP
    │
    ▼
MemoryService / ContextService
    │
    ├── IMemoryRepository (= IMemoryReader + IMemoryWriter)
    │
    └── memory/
            Retriever ──► IRetrievalCandidateSource
                              ├── SqlRetrievalCandidateSource  ✅ today
                              └── VectorRetrievalCandidateSource  🔲 Phase 6
            Ranker ──► ranking.engine (lexical today)
            ContextBuilder / PromptBuilder
```

Phase 5 sits **below services**, **above storage**:

```
MemoryService (create/update)
    │
    ▼
EmbeddingJobQueue (async) ──► IEmbeddingProvider.embed(batch)
    │
    ▼
IEmbeddingStore.upsert(memoryId, vector, modelId)
    │
    ▼
IMemoryWriter.setEmbeddingId(memoryId, embeddingId)
```

**Rule (constitution):** Never call `embed()` inside `insert()` or `update()` synchronously. Embedding is a **side effect** triggered by events or batch jobs.

---

## 3. Ports & Interfaces

### 3.1 `IEmbeddingProvider`

Pure infrastructure port — no SQL, no HTTP.

```typescript
export interface EmbeddingInput {
  memoryId: string;
  text: string; // normalized: title + summary + excerpt(content, 500)
}

export interface EmbeddingResult {
  memoryId: string;
  vector: number[];
  modelId: string;
  dimensions: number;
}

export interface IEmbeddingProvider {
  readonly modelId: string;
  readonly dimensions: number;
  embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]>;
}
```

| Requirement | Detail |
|-------------|--------|
| Batch | `embed()` accepts 1..N inputs; provider batches per vendor limits |
| Idempotency | Same `memoryId` + same `modelId` → upsert replaces prior vector |
| Errors | Per-item failure in batch; job retries failed IDs only |
| Config | `EMBEDDING_MODEL`, `EMBEDDING_API_KEY`, optional `EMBEDDING_BASE_URL` |

**First implementations (proposed order):**

1. `NoopEmbeddingProvider` — returns zero vector; tests + local dev without API key
2. `OpenAIEmbeddingProvider` — `text-embedding-3-small` (1536 dims) or configurable
3. (Later) `WorkersAIEmbeddingProvider` — if deployed on Cloudflare edge

### 3.2 `IEmbeddingStore`

Abstraction for vector persistence. Phase 5 may use D1 JSON blob **only for MVP/dev**; production target is external vector DB.

```typescript
export interface StoredEmbedding {
  id: string;           // becomes memories.embedding_id
  memoryId: string;
  ownerId: string;
  modelId: string;
  dimensions: number;
  vector: number[];     // or opaque handle if external store returns ID only
  createdAt: string;
}

export interface IEmbeddingStore {
  upsert(record: StoredEmbedding): Promise<string>; // returns embedding id
  deleteByMemoryId(memoryId: string, ownerId: string): Promise<void>;
  findByMemoryId(memoryId: string, ownerId: string): Promise<StoredEmbedding | null>;
}
```

| Implementation | When | Notes |
|----------------|------|-------|
| `D1EmbeddingStore` | Phase 5 MVP | Table `memory_embeddings`; OK for &lt;10k vectors |
| `PgVectorEmbeddingStore` | Phase 5+ / scale | Postgres + pgvector |
| `CloudflareVectorizeStore` | Optional | If using CF vector index |

### 3.3 `IEmbeddingJobRunner`

Orchestrates backfill and incremental embed jobs (not HTTP-facing).

```typescript
export interface EmbeddingJobOptions {
  ownerId: string;
  projectId?: string;
  batchSize?: number;      // default 32
  dryRun?: boolean;
  forceReembed?: boolean;  // ignore existing embedding_id
}

export interface EmbeddingJobReport {
  scanned: number;
  embedded: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface IEmbeddingJobRunner {
  run(options: EmbeddingJobOptions): Promise<EmbeddingJobReport>;
}
```

Invoked via `npm run db:backfill-embeddings` (script), same pattern as M4b backfill.

### 3.4 `IContentStore` (reserved — not Phase 5 core)

Documented for alignment with `object_key`:

```typescript
export interface IContentStore {
  put(key: string, body: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}
```

Large `content` migration to R2 is **out of scope** for Phase 5 implementation commits unless explicitly approved.

---

## 4. Schema Design

### 4.1 Existing column (no change)

| Column | Table | Purpose |
|--------|-------|---------|
| `embedding_id` | `memories` | Opaque FK to `memory_embeddings.id` or external vector ID |

### 4.2 New table: `memory_embeddings`

```sql
CREATE TABLE memory_embeddings (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  vector_json TEXT NOT NULL,   -- JSON array of floats; replace with BYTEA/pgvector later
  content_hash TEXT NOT NULL,  -- hash of text embedded; skip re-embed if unchanged
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_memory_embeddings_owner_memory
  ON memory_embeddings (owner_id, memory_id);

CREATE UNIQUE INDEX idx_memory_embeddings_memory_model
  ON memory_embeddings (memory_id, model_id);
```

**Why separate table (Phase 2.6 decision W3):** Keeps `memories` rows small; enables model migration (re-embed all with new `model_id` without ALTER on main table).

### 4.3 Text normalization for embed input

Reuse Phase 4 semantic-hash normalization where possible:

```
embedText = normalize(title) + "\n" + normalize(summary) + "\n" + excerpt(content, 500)
content_hash = sha256(embedText)
```

Skip embed when `content_hash` matches existing row and `forceReembed` is false.

---

## 5. Pipelines

### 5.1 Incremental (post-create / post-update)

```
MemoryService.createMemory / updateMemory
    │
    └── emit MemoryChangedEvent { memoryId, ownerId, changeType }
            │
            └── EmbeddingJobRunner.enqueue(memoryId)   // in-process queue or script poll
```

For serverless (Vercel): **no in-process daemon**. Options:

| Mode | Mechanism |
|------|-----------|
| **A (recommended)** | Cron / manual `db:backfill-embeddings` catches up |
| **B** | Vercel Cron hits internal `/api/v1/jobs/embed` (auth + `memory.write`) |
| **C** | MCP/CLI trigger after bulk import |

Phase 5 ships **A + script**; B is optional follow-up.

### 5.2 Backfill

```
npm run db:backfill-embeddings [--owner=...] [--dry-run] [--force]
```

1. `IMemoryReader.findWithoutEmbedding(ownerId, limit)` — new reader method  
2. Batch → `IEmbeddingProvider.embed`  
3. `IEmbeddingStore.upsert`  
4. `IMemoryWriter.applyEmbeddingBackfill(id, ownerId, { embeddingId })` — new writer method  

Same idempotent pattern as `applyMemoryIntelligenceBackfill`.

### 5.3 Delete / archive

| Action | Embedding behavior |
|--------|-------------------|
| Hard delete memory | `IEmbeddingStore.deleteByMemoryId` + clear `embedding_id` |
| Archive | Keep embedding (retrieval excludes archived) |
| Consolidator archive duplicate | Delete embedding for archived duplicate optional (GC job) |

---

## 6. Phase 6 Handoff (Vector Retrieval)

Phase 5 **does not** change `Retriever` ranking. Phase 6 adds:

```typescript
class VectorRetrievalCandidateSource implements IRetrievalCandidateSource {
  constructor(
    private readonly embeddingStore: IEmbeddingStore,
    private readonly provider: IEmbeddingProvider, // query embed only
    private readonly reader: IMemoryReader,
  ) {}
  async findCandidates(filters: RetrievalFilters): Promise<Memory[]> {
    // 1. embed query (if present)
    // 2. vector top-K by owner_id
    // 3. hydrate Memory rows via reader.findById (batch)
  }
}
```

`Retriever` merges multiple sources (SQL + vector), dedupes by `memoryId`, applies cap — design detail in Phase 6 doc.

`Ranker` gains fusion weights (`lexicalWeight`, `vectorWeight`) in `ranking.config.ts`.

---

## 7. Configuration

| Env var | Required | Default | Description |
|---------|----------|---------|-------------|
| `EMBEDDING_PROVIDER` | prod | `noop` | `noop` \| `openai` |
| `EMBEDDING_MODEL` | if openai | `text-embedding-3-small` | Model id |
| `EMBEDDING_API_KEY` | if openai | — | Vendor API key |
| `EMBEDDING_BATCH_SIZE` | no | `32` | Max texts per `embed()` call |
| `EMBEDDING_MAX_RETRIES` | no | `3` | Per-memory retry |

Validated in `src/config/env.ts` (Zod). Production with `EMBEDDING_PROVIDER=openai` requires API key.

---

## 8. Security & Multi-tenancy

- All embedding queries scoped by `owner_id` (same as memories)
- `IEmbeddingStore` methods always take `ownerId`
- Embedding job scripts require same env credentials as migrate (D1 token)
- No PII in logs — log `memoryId` + `content_hash`, not raw text
- MCP production: `MCP_OWNER_ID` required (milestone D ✅)

---

## 9. Observability

| Event | When | Sink |
|-------|------|------|
| `embedding.job.started` | backfill begin | stdout / future audit |
| `embedding.job.completed` | backfill end | report JSON |
| `embedding.failed` | per-memory error | stderr + retry queue |

Phase 9+ may add `audit_logs` entries for embedding jobs.

---

## 10. Migration Plan

| Step | Migration | Description |
|------|-----------|-------------|
| **M5a** | `CREATE TABLE memory_embeddings` | Schema only |
| **M5b** | Indexes | `(owner_id, memory_id)`, UNIQUE `(memory_id, model_id)` |
| **M5c** | Backfill script | `db:backfill-embeddings` |

No changes to REST/MCP request or response shapes in Phase 5. Optional: expose `embeddingId` in API if already on `Memory` type (field exists, may stay null).

---

## 11. Implementation Commits (Proposed — post-approval)

| # | Commit | Deliverable |
|---|--------|-------------|
| 1 | `feat(embedding): add IEmbeddingProvider and NoopEmbeddingProvider` | Port + noop impl + unit tests |
| 2 | `feat(embedding): add memory_embeddings schema M5a/b` | migration + mock D1 |
| 3 | `feat(embedding): add D1EmbeddingStore and IEmbeddingStore` | SQL in repository layer only |
| 4 | `feat(embedding): add EmbeddingJobRunner and backfill script` | `npm run db:backfill-embeddings` |
| 5 | `feat(embedding): add OpenAIEmbeddingProvider` | behind env flag |
| 6 | `chore(docs): update ARCHITECTURE for Phase 5 status` | status table only |

**Quality gate per commit:** lint, typecheck, tests PASS. No `*V2` classes.

**Dependency order:** 1 → 2 → 3 → 4 → 5 → 6. Phase 6 vector source is a **separate design approval**.

---

## 12. Testing Strategy

| Layer | Tests |
|-------|-------|
| `NoopEmbeddingProvider` | deterministic zero vector, dimensions |
| `D1EmbeddingStore` | mock D1 upsert/find/delete |
| `EmbeddingJobRunner` | dry-run, skip unchanged hash, batch boundary |
| `MemoryService` | create does **not** call embed synchronously (spy) |
| E2E | optional — skip if no API key; noop provider in CI |

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| D1 size with `vector_json` | DB bloat | Cap MVP; plan pgvector/Vectorize before 10k vectors |
| API cost | Bill shock | batch + content_hash skip + dry-run default |
| Model change | Stale vectors | `model_id` in store; `forceReembed` backfill |
| Serverless timeout | backfill fails | paginated script, resume cursor |
| Embedding in insert() | latency + coupling | constitution + code review gate |

---

## 14. Decisions Log

| ID | Decision | Rationale |
|----|----------|-----------|
| P5-D1 | Separate `memory_embeddings` table | Phase 2.6 W3; keeps rows small |
| P5-D2 | Async embed only | Constitution; serverless-friendly |
| P5-D3 | `embedding_id` on `memories` | Already reserved M4a |
| P5-D4 | Noop provider for CI/dev | No API key required in tests |
| P5-D5 | Vector retrieval in Phase 6 | `IRetrievalCandidateSource` ready after milestone F |
| P5-D6 | `content_hash` for skip | Avoid redundant API calls on no-op updates |
| P5-D7 | No MCP contract change | Additive fields only |

---

## 15. Open Questions (for approval)

1. **Default provider in production:** OpenAI vs Workers AI vs bring-your-own?
2. **Embed on create:** Cron-only catch-up OK for v1, or require Vercel Cron endpoint?
3. **Vector storage MVP:** D1 JSON acceptable for personal scale (&lt;5k memories), or jump straight to Vectorize?
4. **Expose `embeddingId` in REST:** return field when set, or hide until Phase 6?

---

## 16. Definition of Done (Phase 5)

- [ ] `IEmbeddingProvider` + `NoopEmbeddingProvider` with tests
- [ ] `memory_embeddings` table + `D1EmbeddingStore`
- [ ] `EmbeddingJobRunner` + `npm run db:backfill-embeddings`
- [ ] `applyEmbeddingBackfill` on `IMemoryWriter`; reader query for missing embeddings
- [ ] OpenAI provider behind env (optional in prod)
- [ ] No synchronous embed in `insert()` / `update()`
- [ ] ARCHITECTURE.md Phase 5 row updated
- [ ] All existing tests pass; new tests for embedding ports

---

**Next step:** Owner approval on §15 open questions, then implement commits in §11 in order.

**Related docs:** [PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md)
