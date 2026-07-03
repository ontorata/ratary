# Task Prompt — Phase 6 Hybrid Retrieval

**Status:** Active  
**Template:** [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md)  
**ADR:** [ADR-001 Multi-Source Retrieval](docs/adr/001-multi-source-retrieval.md) — **Approved**

**Before coding:** [ai-rules/11-AI-RULES.md](ai-rules/11-AI-RULES.md) · [architecture/04-ARCHITECTURE.md](architecture/04-ARCHITECTURE.md) · [workflow/05-WORKFLOW.md](workflow/05-WORKFLOW.md)

---

# TASK

Implement: **Phase 6 — Hybrid Retrieval**

Hybrid SQL + vector retrieval via `CompositeRetrievalCandidateSource` (Option B from ADR-001), using Reciprocal Rank Fusion (RRF) to merge ranked candidates from multiple sources without rewriting `Retriever` or `ContextService`.

---

## Requirements

### ADR gates (Pre-approved)

| ADR | Title | Status |
|-----|-------|--------|
| [001](docs/adr/001-multi-source-retrieval.md) | Multi-Source Retrieval | **Approved** ✅ |
| [002](docs/adr/002-workspace-identity-model.md) | Workspace & identity | **Approved** |
| [003](docs/adr/003-embedding-storage-mvp.md) | Embedding storage MVP | **Implemented** |
| [004](docs/adr/004-repository-port-types.md) | Repository port types | **Implemented** |

### Functional requirements

- `CompositeRetrievalCandidateSource` implementing `IRetrievalCandidateSource`
  - Wraps `IRetrievalCandidateSource[]` (SQL + vector sources)
  - Applies Reciprocal Rank Fusion (RRF) for score-agnostic merge
  - Dedupes by `memoryId`
  - Applies `RETRIEVAL_CANDIDATE_CAP` after merge
- `VectorRetrievalCandidateSource` implementing `IRetrievalCandidateSource`
  - Embeds query via `IEmbeddingProvider`
  - Fetches candidates via `IEmbeddingStore.searchSimilar`
  - Owner-scoped queries
- RRF config in `ranking.config.ts` (k=60, SOURCE_CAPS)
- Composition root wiring behind `HYBRID_RETRIEVAL=true` env flag (default: false)
- Unit tests for `CompositeRetrievalCandidateSource` (dedupe, cap, empty sources, RRF)
- Unit tests for `VectorRetrievalCandidateSource`

### Future compatibility (must remain ✓)

| Phase | Requirement |
|-------|-------------|
| 7 Agent | No change to context API |
| 8 Graph | `GraphRetrievalCandidateSource` added to composite array |

---

## Constraints

- Follow [11-AI-RULES.md](ai-rules/11-AI-RULES.md)
- **No changes to `Retriever` or `ContextService`**
- No changes to REST/MCP contracts
- No `*V2` classes, no `TODO`/`FIXME`, no stubs
- No vector SQL in `MemoryRepository`
- RRF is pure calculation — no side effects
- Owner-scoped all candidate queries
- One concern per commit; quality gate after each commit

---

## Expected deliverables

| Deliverable | Detail |
|-------------|--------|
| **Code** | `src/memory/composite-retrieval-candidate-source.ts`, `src/memory/vector-retrieval-candidate-source.ts` |
| **Tests** | `tests/memory/composite-retrieval-candidate-source.test.ts`, vector source tests |
| **Config** | RRF config in `src/search/ranking.config.ts` |
| **Wiring** | `server.ts`, `mcp/server.ts` behind `HYBRID_RETRIEVAL` flag |
| **Documentation** | Architecture update, ADR status |

---

## Implementation plan (commits)

| # | Commit | Scope |
|---|--------|--------|
| 1 | RRF config | `ranking.config.ts` — RRF_CONFIG with k=60, SOURCE_CAPS |
| 2 | Composite source | `CompositeRetrievalCandidateSource` + tests |
| 3 | Vector source | `VectorRetrievalCandidateSource` + tests |
| 4 | Composition root | Wire in `server.ts` and `mcp/server.ts` |
| 5 | Documentation | ARCHITECTURE, ADR-001 status |

**Quality gate (every commit):**

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

---

## RRF Algorithm (from ADR-001)

```
For each document d in union of all sources:
  rrf_score = Σᵢ 1 / (k + rankᵢ(d))
  Where rankᵢ(d) = position of d in source i (1-based; 0 = not found)

Parameters:
  k = 60 (standard constant)
  SOURCE_CAPS.sql = 50 (50% of cap)
  SOURCE_CAPS.vector = 50 (50% of cap)
```

---

## Definition of done

- [ ] `CompositeRetrievalCandidateSource` with RRF implemented
- [ ] `VectorRetrievalCandidateSource` implemented
- [ ] RRF config added to `ranking.config.ts`
- [ ] Composition root wiring behind `HYBRID_RETRIEVAL` flag
- [ ] Unit tests: composite source (dedupe, cap, empty, RRF)
- [ ] Unit tests: vector source
- [ ] 180+ tests green (172 current + new)
- [ ] No TODO/FIXME
- [ ] Docs updated; phase folder COMPLETION.md created

---

## References

- [archive/PHASE-6-HYBRID-DESIGN.md](archive/PHASE-6-HYBRID-DESIGN.md)
- [phases/06-hybrid-retrieval/DESIGN.md](phases/06-hybrid-retrieval/DESIGN.md)
- [docs/adr/001-multi-source-retrieval.md](docs/adr/001-multi-source-retrieval.md)
