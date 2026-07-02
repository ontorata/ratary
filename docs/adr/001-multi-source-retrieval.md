# ADR-001: Multi-Source Retrieval (Hybrid RAG)

**Status:** Proposed  
**Date:** 2026-07-01  
**Deciders:** Project owner  

---

## Context

Phase 4 introduced `IRetrievalCandidateSource` and `SqlRetrievalCandidateSource`. `Retriever` depends on the port, not D1. Phase 6 requires SQL lexical candidates **plus** vector (and later graph) candidates merged under a single cap.

Constitution: Retriever stays storage-agnostic; no vector SQL inside `MemoryRepository`.

## Problem

`Retriever` accepts a single `IRetrievalCandidateSource`. Adding vector search by extending `MemoryRepository` or `Retriever` with `if (vector)` violates OCP and couples metadata SQL to vector stores.

Without a merge strategy, Phase 6 forces a rewrite of `ContextService` or `Retriever`.

## Constraints

- No changes to MCP/REST tool contracts for Phase 6 core.
- `IRetrievalCandidateSource` contract unchanged (same `findCandidates` signature).
- No `RetrieverV2`, no vector logic in `IMemoryRepository`.
- Merge cap must respect existing `RETRIEVAL_SQL_CAP` / `RETRIEVAL_CANDIDATE_CAP` semantics.
- Owner scoping on every candidate (`ownerId` in filters).

## Alternatives

### Option A — `Retriever` merges multiple sources internally

- Pros: Single wiring point; `Retriever` owns cap/dedupe.
- Cons: `Retriever` grows; harder to test sources in isolation; violates thin Retriever.

### Option B — `CompositeRetrievalCandidateSource` implements `IRetrievalCandidateSource`

- Pros: OCP — new sources plug in without changing `Retriever` or `ContextService`; each source unit-testable.
- Cons: Composite policy (dedupe, cap, ordering) must be specified once.

### Option C — `ContextService` orchestrates multiple sources

- Pros: Flexible per-request source selection.
- Cons: Orchestrator knows storage; breaks layer boundary; duplicates merge logic.

## Decision

**Adopt Option B:** introduce `CompositeRetrievalCandidateSource` that wraps `IRetrievalCandidateSource[]`, dedupes by `memoryId`, merges, and applies `maxCandidates` from `RetrievalFilters`.

`Retriever` and `ContextService` remain unchanged. Composition root wires:

`Composite([SqlRetrievalCandidateSource, VectorRetrievalCandidateSource])`.

## Tradeoffs

- **Gain:** Phase 6 vector + Phase 8 graph sources added as new adapter classes only.
- **Accept:** Merge policy lives in one composite (must document: dedupe key = `memoryId`, cap after merge).
- **Accept:** Parallel source queries may increase latency (mitigate with caps per source).

## Migration

1. Add `CompositeRetrievalCandidateSource` + tests (dedupe, cap, empty sources).
2. Add `VectorRetrievalCandidateSource` (depends on ADR-003 `IEmbeddingStore.searchSimilar`).
3. Wire composite in `server.ts` / `mcp/server.ts` behind env flag `HYBRID_RETRIEVAL=true` (default false until Phase 6).
4. No schema migration required for composite itself.

## Rollback

- Set `HYBRID_RETRIEVAL=false` or wire single `SqlRetrievalCandidateSource` only.
- Remove composite from composition root; no data migration.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | Vector source depends on `IEmbeddingStore`; composite ready but optional |
| 6 Hybrid Retrieval | **Primary enabler** — SQL + vector merge without rewrite |
| 7 Agent Runtime | No change; agents consume same context API |
| 8 Knowledge Graph | `GraphRetrievalCandidateSource` added to composite array |
| 9 Multi AI | Merge must respect scope per [ADR-002](002-workspace-identity-model.md); `workspaceId` in filters when active |
| 10 Enterprise | Composite can log source mix for audit |

---

## References

- [AI_BRAIN_CONSTITUTION.md](../AI_BRAIN_CONSTITUTION.md)
- [ADR-POLICY.md](../ADR-POLICY.md)
- [archive/PHASE-5-EMBEDDING-DESIGN.md](../archive/PHASE-5-EMBEDDING-DESIGN.md)
