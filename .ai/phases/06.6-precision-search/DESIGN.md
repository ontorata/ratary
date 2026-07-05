# Phase 6.6 — Precision Search Platform — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented (waves 6.6A–E) · gate review pending (2026-07-05)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Roadmap placement:** Extension track **06.6** — after Phase 6 + 6.5, complements Phase 21  
**ADR gate:** [ADR-060](../../adr/060-precision-search-platform.md) — **Implemented** (2026-07-05)

---

## Purpose

Deliver a **Precision Search Platform** — explicit, agent-discoverable search semantics on top of Ratary's memory model:

| Capability | Ratary today | Phase 6.6 target |
|------------|--------------|------------------|
| Hybrid fusion | RRF across sql / vector / graph **sources** | + RRF across **multiple query strings** |
| Lexical rank | SQL LIKE + weighted `rankMemories` | + optional BM25 (Meilisearch) + fuzzy title |
| Search modes | Implicit single path | `hybrid` \| `semantic` \| `fulltext` \| `title` |
| Aliases | Codename, keywords, slug | + `aliases[]` with indexed boost |
| Similar notes | Query-only vector | + `similar_to` memory id / slug / path |
| Graph | Bidirectional BFS, memoryId seed | + `direction` filter; path/slug seed |
| Result envelope | Memory row | + outgoing links, backlinks, snippet |
| Scope | Single project/tag | Multi-value + exclusion grammar |
| Rerank | None | Optional cross-encoder (noop default) |
| Local embed | noop + openai | + optional local adapter (05.6) |

**Non-goal:** Replicate a markdown vault CLI (`ohs`) inside Ratary. Path and frontmatter are **compatibility surfaces** for ingest and search — not a requirement to store only as files.

---

## Scope

### Inside this repository

| Area | Deliverable |
|------|-------------|
| **Application** | `IPrecisionSearchService`, `PrecisionSearchOrchestrator` |
| **Ports** | `ISearchModeStrategy`, `IMultiQueryFusion`, `IReranker`, `ISearchResultEnricher`, `IFuzzyTitleMatcher` |
| **Schema** | `aliases` JSON column; `source_path` TEXT; optional `memory_chunks` (Phase 6.6E stretch) |
| **API** | Extend `GET /api/v1/search`, MCP `search_memory`, add `GET /api/v1/memory/:id/similar` |
| **Graph** | Additive `direction` on traverse body |
| **Manifest** | `supportsPrecisionSearch`, `search.modes[]`, `search.rerankAvailable` |
| **CLI** (stretch) | `@ratary/cli search` flags mirroring API |

### Outside this repository

| Capability | Location |
|------------|----------|
| Agent query reformulation loops | External agent |
| Vault file watcher UX | Client / Obsidian plugin |
| Training cross-encoder models | External ML pipeline |

### Non-goals

- Replacing `ContextService` / `IRetrievalPolicy` (Phase 6.5)
- Chunk-level embeddings in v1 wave A–D (optional wave E)
- Mandatory Meilisearch for default D1 deploy
- Auto-indexing markdown vault trees without ingest connector

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clients: MCP search_memory · REST GET /search · CLI (Phase 16)         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              IPrecisionSearchService (NEW — gated)                       │
│  1. Parse PrecisionSearchRequest (mode, queries[], filters, rerank)     │
│  2. Resolve scope (owner, workspace, filter grammar)                  │
│  3. For each mode → ISearchModeStrategy → candidate IDs + ranks         │
│  4. IMultiQueryFusion (RRF over queries × sources)                      │
│  5. Optional IReranker.rerank (top-K)                                   │
│  6. ISearchResultEnricher (snippet, links, backlinks, aliases)          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 SqlLexicalStrategy      VectorSemanticStrategy    MeilisearchBm25Strategy
 (existing repo)         (Phase 6 leg)             (Phase 21 when enabled)
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    CompositeRetrievalCandidateSource (reuse, not fork)
```

### Boundary: Search vs Retrieval vs Context

| Pipeline | Endpoint / tool | Phase owner | Phase 6.6 role |
|----------|-----------------|-------------|----------------|
| **Browse search** | `GET /search`, `search_memory` | 6.6 | **Primary** — modes, multi-query, enrich |
| **Retrieval candidates** | Internal to `Retriever` | 6 | Reuse sources; no behavior change when flag OFF |
| **Context assembly** | `get_context`, `/context` | 6.5 | Unchanged; may *consume* precision search internally later (optional) |

---

## Feature specification (gap → design)

### 1. Hybrid search (BM25 + fuzzy title + semantic + RRF)

| Layer | v1 design |
|-------|-----------|
| **Semantic** | Existing `VectorRetrievalCandidateSource` when `HYBRID_RETRIEVAL` + embed provider |
| **Fulltext / BM25** | `MeilisearchRetrievalSource` when `SEARCH_PROVIDER=meilisearch`; else SQL lexical leg with weighted fields |
| **Title fuzzy** | `IFuzzyTitleMatcher` port — Levenshtein / trigram on `title` + `aliases[]`; boost configurable (`TITLE_FUZZY_BOOST`, default 3×) |
| **Fusion** | Weighted RRF (existing `RRF_CONFIG`) per source **per query**, then `IMultiQueryFusion` across queries |

**Not in v1:** Custom BM25 in SQLite — defer to Meilisearch leg or future Postgres FTS adapter.

### 2. Alias search

| Field | Type | Index |
|-------|------|-------|
| `aliases` | JSON string array on `memories` | Meilisearch filterable + SQL JSON extract for D1 |

- Ingest: map frontmatter `aliases:` via backup import + Knowledge Fabric connector (Phase 23 hook).
- Rank boost: alias exact match weight = **5×** title contains (configurable `ALIAS_EXACT_BOOST=500` scale vs `RANKING_WEIGHTS`).
- Codename remains; aliases are **additional** surface names.

### 3. Four search modes

```typescript
type PrecisionSearchMode = 'hybrid' | 'semantic' | 'fulltext' | 'title';

interface PrecisionSearchRequest {
  queries: string[];           // min 1; single q → [q]
  mode?: PrecisionSearchMode;  // default 'hybrid'
  rerank?: boolean;
  snippetLength?: number;      // chars; 0 = omit snippet, fall back to summary/content in enricher
  filters?: SearchFilterGrammar;
  similarTo?: SimilarToRef;    // mutually exclusive with text queries in v1
  limit?: number;
  offset?: number;
}
```

| Mode | Active legs |
|------|-------------|
| `hybrid` | sql + vector (+ meilisearch if enabled) → RRF |
| `semantic` | vector only (noop embed → degrade to sql keyword with warning in manifest) |
| `fulltext` | meilisearch or sql content/summary |
| `title` | title + aliases + fuzzy title matcher only |

### 4. Similar note lookup

```typescript
interface SimilarToRef {
  memoryId?: string;
  slug?: string;
  sourcePath?: string;  // vault-relative
}

GET /api/v1/memory/similar?memoryId=...&limit=10
```

- Primary: embedding cosine vs stored vector for target memory.
- Fallback: title token overlap + shared tags (existing `SemanticSimilaritySource` logic).
- Chunk embeddings (`memory_chunks`) — **Wave 06.6E** optional; v1 uses document-level embedding.

### 5. Graph traversal enhancements

Extend [traverseGraphBodySchema](../../../src/types/graph.ts):

```typescript
direction?: 'outgoing' | 'incoming' | 'both';  // default 'both' — preserves current behavior
seed?: { memoryId?: string; slug?: string; sourcePath?: string };
```

- `traverse_relations` MCP accepts same additive fields.
- Path seed resolves via `source_path` unique per owner (nullable).

### 6. Links & backlinks in search results

`ISearchResultEnricher` batch-loads relations for hit IDs:

```typescript
interface PrecisionSearchHit extends ScoredMemory {
  snippet: string;
  aliases: string[];
  sourcePath: string | null;
  outgoingLinks: Array<{ memoryId: string; relation: string; title?: string }>;
  backlinks: Array<{ memoryId: string; relation: string; title?: string }>;
  tags: string[];
}
```

Cap relations per hit (`SEARCH_ENRICH_LINK_CAP`, default 20) to bound query cost.

### 7. Scope filtering

```typescript
interface SearchFilterGrammar {
  project?: string[];
  projectExclude?: string[];
  sourcePathPrefix?: string[];
  sourcePathExclude?: string[];   // e.g. notes/dev/
  tag?: string[];
  tagExclude?: string[];
  category?: string[];
  workspaceId?: string;           // existing scope
}
```

SQL builder + Meilisearch filter translation in infrastructure adapters — **not** stringly-typed raw SQL from client.

### 8. Tag filtering

- Multi-tag: default **OR** within tag list; optional `tagMode: 'and'` query param.
- Exclusion: `tagExclude` applied after candidate fetch (same as `-category/cs` intent).

### 9. Snippet control

- `snippetLength` (default 200): extract window around first match in summary/content.
- Empty snippet → enricher returns first `min(snippetLength, summary.length)` of summary, else content prefix.

### 10. Extended output (CLI / MCP)

- REST returns full JSON envelope above.
- MCP `search_memory` optional `extended: true` → include aliases + tags inline (no separate CLI table requirement in v1).
- `@ratary/cli search --extended` — Wave 06.6E / Phase 16 coordination.

### 11. Incremental indexing

| Index | Mechanism |
|-------|-----------|
| Meilisearch | Existing Phase 21 incremental sync — hook on memory CRUD events (Phase 12 consumer optional) |
| Embeddings | Existing async embed on write (Phase 5) |
| Aliases/path | Synchronous on memory upsert — no separate indexer |

Real-time **file** watch remains backup import (`sync:backups:watch`) — not generalized vault watcher in 6.6.

### 12. Multi-query fan-out

```typescript
interface IMultiQueryFusion {
  fuse(perQueryRanked: Map<string, Memory[][]>, options: { k?: number }): Memory[];
}
```

- MCP: `queries: string[]` param; REST: `q=a&q=b` or `queries[]=`.
- RRF merges ranks — memory strong in **any** query rises (same k=60 default, tunable `MULTI_QUERY_RRF_K`).

### 13. Cross-encoder reranking

```typescript
interface IReranker {
  rerank(query: string, candidates: PrecisionSearchHit[], topK: number): Promise<PrecisionSearchHit[]>;
}
```

- Default: `NoopReranker`.
- Optional: `OnnxCrossEncoderReranker` — model `bge-reranker-v2-m3` int8, lazy download to `~/.cache/ratary/models/` (env `RERANK_MODEL_PATH`).
- Applied **after** multi-query merge, **before** enricher.
- Flag: `SEARCH_RERANK_ENABLED` + request `rerank=true`.

### 14. Local embeddings (coordination with 05.6)

Phase 6.6E adds **Phase 5.6** track (separate folder optional):

| Env | Provider |
|-----|----------|
| `EMBEDDING_PROVIDER=local` | `@huggingface/transformers` — default model `Xenova/multilingual-e5-small` |
| `EMBEDDING_PROVIDER=openai` | Existing — `EMBEDDING_BASE_URL` for Ollama/OpenRouter |

Precision search **does not** embed — it **consumes** vector leg when semantic/hybrid modes active.

### 15. Note reading by path

```typescript
GET /api/v1/memory/by-path?path=notes/architecture.md
GET /api/v1/memory/by-path?path=notes/architecture.md&suggest=true  // on miss → top 3 fuzzy paths
```

Returns full memory + aliases, tags, links, backlinks (same enricher). MCP: `get_memory_by_path` (new tool, gated).

### 16. Ignore patterns

Env `SEARCH_IGNORE_PATTERNS` — comma-separated globs applied to `source_path` at index and query time:

```
SEARCH_IGNORE_PATTERNS=**/node_modules/**,**/.git/**,**/subagents/**
```

Backup import already skips subsets — align patterns in shared `src/search/ignore-patterns.ts`.

---

## Module structure (planned)

```
src/
  search/
    precision/
      iprecision-search-service.interface.ts
      precision-search.service.ts
      precision-search-orchestrator.ts
      search-filter-grammar.ts
      search-mode-strategy.ts          # hybrid | semantic | fulltext | title
      multi-query-rrf.ts
      search-result-enricher.ts
      fuzzy-title-matcher.ts
      ignore-patterns.ts
    rerank/
      ireranker.port.ts
      noop-reranker.ts
      onnx-cross-encoder-reranker.ts   # opt-in
  embedding/
    local-embedding.provider.ts        # Phase 5.6
  types/
    precision-search.ts
  routes/v1/
    precision-search.routes.ts         # or extend search.routes
  transport/mcp/
    # extend search_memory, add get_memory_by_path
```

Composition root: `create-precision-search-ports.ts` — wired when `PRECISION_SEARCH_ENABLED=true`.

---

## Storage impact

| Change | DDL |
|--------|-----|
| `memories.aliases` | `TEXT` JSON array, default `[]` |
| `memories.source_path` | `TEXT NULL` |
| Index | `idx_memories_owner_source_path` UNIQUE WHERE NOT NULL |
| Optional 6.6E | `memory_chunks` table (id, memory_id, chunk_index, content, embedding_id) |

Backfill: `npm run db:backfill-precision-search` — populate `source_path` from import metadata where detectable; aliases from keywords optional migration.

See [MIGRATION.md](MIGRATION.md).

---

## API impact

| Method | Endpoint | Change |
|--------|----------|--------|
| `GET` | `/api/v1/search` | Additive query params: `mode`, `queries[]`, `rerank`, `snippet_length`, filter grammar, `extended` |
| `GET` | `/api/v1/memory/similar` | **New** |
| `GET` | `/api/v1/memory/by-path` | **New** |
| `POST` | `/api/v1/graph/traverse` | Additive `direction`, `seed.slug`, `seed.sourcePath` |
| `GET` | `/api/v1/capabilities` | Additive precision search flags |

Legacy params `q`, `tag`, `project` **remain** — map to filter grammar internally.

---

## MCP impact

| Tool | Change |
|------|--------|
| `search_memory` | Additive: `mode`, `queries[]`, `rerank`, `snippetLength`, `extended`, filter fields |
| `get_memory_by_path` | **New** (gated) |
| `traverse_relations` | Additive `direction`, path/slug seed |
| All others | Unchanged |

When `PRECISION_SEARCH_ENABLED=false`, MCP tools behave as today (no new params required).

---

## Environment flags

| Variable | Default | Purpose |
|----------|---------|---------|
| `PRECISION_SEARCH_ENABLED` | `false` | Master gate |
| `SEARCH_DEFAULT_MODE` | `hybrid` | Default mode |
| `MULTI_QUERY_RRF_K` | `60` | RRF constant for query fusion |
| `ALIAS_EXACT_BOOST` | `500` | Ranking weight scale |
| `TITLE_FUZZY_BOOST` | `3` | Multiplier vs title contains |
| `SEARCH_ENRICH_LINK_CAP` | `20` | Max relations per hit |
| `SEARCH_RERANK_ENABLED` | `false` | Load reranker adapter |
| `RERANK_MODEL_PATH` | — | ONNX model directory |
| `SEARCH_IGNORE_PATTERNS` | — | Glob exclusions |
| `EMBEDDING_PROVIDER` | `noop` | `local` for offline semantic (05.6) |

---

## Testing

| Suite | Purpose |
|-------|---------|
| `precision-search-orchestrator.test.ts` | Mode matrix, multi-query RRF |
| `search-filter-grammar.test.ts` | Include/exclude parsing |
| `search-result-enricher.test.ts` | Snippet, links, backlink cap |
| `fuzzy-title-matcher.test.ts` | Typo tolerance |
| `similar-memory.test.ts` | Vector + fallback |
| `graph-direction.test.ts` | outgoing/incoming/both |
| `cross-owner-leak.test.ts` | Filters cannot widen scope |
| `api/precision-search.test.ts` | REST contract |
| `mcp/precision-search.test.ts` | Tool params when flag ON |
| Regression | Flag OFF → identical to pre-6.6 search snapshots |

Performance gate: P95 `/search` ≤ +15% vs baseline with enricher OFF; rerank OFF.

---

## Success criteria (gate)

- [x] ADR-060 **Approved**
- [x] Owner sign-off on DESIGN.md (2026-07-05)
- [x] `PRECISION_SEARCH_ENABLED=false` — zero regression on existing tests (804 pass)
- [x] Four modes implemented and manifest-advertised
- [x] Multi-query RRF with ≥2 queries integration test
- [x] Aliases + source_path migrated; alias boost in ranking engine
- [x] Search hits include links/backlinks when `extended=true`
- [x] Graph traverse `direction` additive; default `both`
- [x] Similar-memory endpoint with embedding + fallback paths
- [x] Optional rerank + local embed behind separate flags (6.6E)

---

## Future interactions

| Phase | Interaction |
|-------|-------------|
| **12 Event Pipeline** | Memory CRUD → Meilisearch incremental enqueue |
| **16 Developer Platform** | CLI `--extended`, `--rerank`, `--snippet-length` |
| **21 Search Graph Prod** | BM25 leg quality in production |
| **23 Knowledge Fabric** | Connector sets `source_path` + frontmatter aliases on ingest |
| **05.6** (proposed) | Local embedding adapter for offline semantic mode |

---

## References

| Document | Relevance |
|----------|-----------|
| [ADR-001](../../adr/001-multi-source-retrieval.md) | RRF sources |
| [ADR-014](../../adr/014-meilisearch-retrieval-source.md) | BM25 leg |
| [ADR-024](../../adr/024-progressive-retrieval-policy.md) | Context boundary |
| [ADR-060](../../adr/060-precision-search-platform.md) | Gate |
| [06-hybrid-retrieval](../06-hybrid-retrieval/DESIGN.md) | Vector/sql legs |
| [06.5-progressive-retrieval](../06.5-progressive-retrieval/DESIGN.md) | Context policy |
| [DELIVERY-TRACK.md](DELIVERY-TRACK.md) | Ship order |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Do not contradict Approved ADRs without superseding ADR.*
