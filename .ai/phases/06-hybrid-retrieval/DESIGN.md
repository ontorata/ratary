# Phase 6 — Hybrid Retrieval — DESIGN

**Document:** DESIGN  
**Phase status:** Ready (awaiting ADR-001 Approved)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record approved design intent for Phase 6: hybrid SQL + vector retrieval via port extension, without rewriting `Retriever` or `ContextService`.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase begins — before implementation commits |
| **Updated by** | AI assistant drafts; owner approves via ADR-001 |
| **Read-only when** | Phase gate PASS — frozen as historical design record |
| **Roadmap relation** | Captures scope and architecture evolution row for Phase 6 |

---

## Design record

**ADR:** [ADR-001 Multi-Source Retrieval](../../../docs/adr/001-multi-source-retrieval.md) — **Proposed** (must be **Approved** before code).

### Decision (Option B)

Introduce `CompositeRetrievalCandidateSource` implementing `IRetrievalCandidateSource`:

- Wraps `IRetrievalCandidateSource[]` (SQL + vector sources)
- Dedupes by `memoryId`
- Applies `maxCandidates` from `RetrievalFilters` after merge
- `Retriever` and `ContextService` **unchanged**

### New components

| Component | Responsibility |
|-----------|----------------|
| `VectorRetrievalCandidateSource` | Query embed via `IEmbeddingProvider`; candidates via `IEmbeddingStore.searchSimilar` |
| `CompositeRetrievalCandidateSource` | Merge, dedupe, cap |
| Composition root | Wire composite behind `HYBRID_RETRIEVAL` env flag (default `false`) |

### Non-goals

- No `RetrieverV2` or `ContextService` rewrite
- No vector SQL in `MemoryRepository`
- No REST/MCP contract changes for Phase 6 core
- No schema migration for core hybrid path

### Dependencies (from roadmap)

- Phase 4: `IRetrievalCandidateSource`, `SqlRetrievalCandidateSource`
- Phase 5: `IEmbeddingStore.searchSimilar`, `IEmbeddingProvider`

### Ranking

Fusion weights may extend `RankingEngine` / `ranking.config.ts` — engine remains pure.

---

*Blocked until ADR-001 status is Approved. Do not contradict [09-ROADMAP.md](../../../roadmap/09-ROADMAP.md).*
