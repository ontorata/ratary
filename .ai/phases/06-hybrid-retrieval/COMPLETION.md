# Phase 6 — Hybrid Retrieval — COMPLETION

**Phase status:** ✅ Closed — gate PASS (2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**ADR:** [ADR-001 Multi-Source Retrieval](docs/adr/001-multi-source-retrieval.md)

---

## Summary

Implemented hybrid SQL + vector retrieval using `CompositeRetrievalCandidateSource` with Reciprocal Rank Fusion (RRF) to merge ranked candidates from multiple sources.

---

## Deliverables

### Code

| File | Description |
|------|-------------|
| `src/memory/composite-retrieval-candidate-source.ts` | Composite source with RRF merge |
| `src/memory/vector-retrieval-candidate-source.ts` | Vector-based candidate source |
| `src/memory/create-context-service.ts` | Factory for DI with optional hybrid mode |
| `src/search/ranking.config.ts` | RRF_CONFIG with k=60, SOURCE_CAPS |

### Tests

| File | Coverage |
|------|----------|
| `tests/memory/composite-retrieval-candidate-source.test.ts` | RRF merge, dedupe, cap, empty sources |
| `tests/memory/vector-retrieval-candidate-source.test.ts` | Query embedding, hydration, limits |

### Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `HYBRID_RETRIEVAL` | `false` | Enable hybrid SQL+vector retrieval |

### Fusion Weights (Optional — Implemented)

| Config | Default | Description |
|--------|---------|-------------|
| `RRF_CONFIG.SOURCE_WEIGHTS.sql` | `1.0` | Weight for SQL source in weighted RRF |
| `RRF_CONFIG.SOURCE_WEIGHTS.vector` | `1.0` | Weight for vector source in weighted RRF |

Weighted RRF formula: `score = Σᵢ wᵢ / (k + rankᵢ(d))`

---

## Implementation Details

### RRF Algorithm

```
For each document d in union of all sources:
  rrf_score = Σᵢ wᵢ / (k + rankᵢ(d))
  Where rankᵢ(d) = position of d in source i (1-based; 0 = not found)

Parameters:
  k = 60 (standard constant)
  SOURCE_CAPS.sql = 50 (50% of cap)
  SOURCE_CAPS.vector = 50 (50% of cap)
  SOURCE_WEIGHTS.sql = 1.0 (equal weight)
  SOURCE_WEIGHTS.vector = 1.0 (equal weight)
```

### Architecture

```
ContextService
    │
    └── Retriever
            │
            └── CompositeRetrievalCandidateSource (when HYBRID_RETRIEVAL=true)
                    │
                    ├── SqlRetrievalCandidateSource
                    │       └── findRetrievalCandidates()
                    │
                    └── VectorRetrievalCandidateSource
                            ├── embed() → IEmbeddingProvider
                            ├── searchSimilar() → IEmbeddingStore
                            └── findByIds() → IMemoryReader
```

### Wire-up Points

1. **`src/server.ts`** — Uses `createContextService()` which checks `HYBRID_RETRIEVAL`
2. **`src/mcp/server.ts`** — Uses `createContextService()` for MCP tools
3. **`src/config/env.ts`** — Added `HYBRID_RETRIEVAL` boolean flag

---

## Quality Gates

- ✅ Lint: passing
- ✅ Typecheck: passing  
- ✅ Tests: **196/196 passing** (47 test files)
- ✅ No TODO/FIXME
- ✅ One concern per commit

### Per-Commit Audit

| Commit | Tests | Status |
|--------|-------|--------|
| 4069609 RRF config start | 172/172 | ✅ |
| 692798c CompositeRetrievalCandidateSource | 182/182 | ✅ |
| d3ca8b2 findByIds support | 182/182 | ✅ |
| d1b4c4a VectorRetrievalCandidateSource | 189/189 | ✅ |
| 90669bf wiring changes | 189/189 | ✅ |
| dec0a09 documentation | 189/189 | ✅ |
| fusion-weights weighted RRF | 192/192 | ✅ |

---

## Commits

| # | Commit | Files |
|---|--------|-------|
| 1 | RRF config | `src/search/ranking.config.ts` |
| 2 | Composite source + tests | `src/memory/composite-retrieval-candidate-source.ts`, `tests/memory/composite-retrieval-candidate-source.test.ts` |
| 3 | Vector source + tests | `src/memory/vector-retrieval-candidate-source.ts`, `tests/memory/vector-retrieval-candidate-source.test.ts` |
| 4 | findByIds support | `src/repositories/memory.repository.interface.ts`, `src/repositories/memory.repository.ts`, `tests/helpers/mock-d1.ts` |
| 5 | Wiring | `src/config/env.ts`, `src/memory/create-context-service.ts`, `src/server.ts`, `src/mcp/server.ts` |

---

## Future Compatibility

| Phase | Requirement |
|-------|-------------|
| Phase 7: Agent | No change to context API |
| Phase 8: Graph | Add `GraphRetrievalCandidateSource` to composite array |

---

## Usage

Enable hybrid retrieval by setting:

```bash
HYBRID_RETRIEVAL=true
EMBEDDING_PROVIDER=openai   # required for meaningful vector recall
EMBEDDING_API_KEY=sk-...
```

Run `npm run db:backfill-embeddings` after enabling OpenAI embeddings. **Do not use `EMBEDDING_PROVIDER=noop` with hybrid mode** — zero vectors produce tie scores and arbitrary ranking.

When enabled with real embeddings, the `get_context` and `build_prompt` tools use both SQL and vector search with RRF merging.
