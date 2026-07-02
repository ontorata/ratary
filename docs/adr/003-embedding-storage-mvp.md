# ADR-003: Embedding Storage MVP

**Status:** Implemented  
**Date:** 2026-07-01  
**Deciders:** Project owner  

---

## Context

Phase 5 design (`archive/PHASE-5-EMBEDDING-DESIGN.md`) defines `IEmbeddingProvider` and `IEmbeddingStore`. `memories.embedding_id` is reserved. `IRetrievalCandidateSource` is ready for Phase 6 vector source.

**This ADR decides where vectors live for MVP** and approves Phase 5 structural implementation.

## Problem

Vectors must be stored somewhere without coupling to OpenAI or D1 metadata SQL. Options differ in scale, cost, and migration cost. Implementing without a decision risks wrong abstraction or D1 bloat.

## Constraints

- Async embed only — never in `insert()` / `update()` (constitution).
- `IEmbeddingProvider` and `IEmbeddingStore` remain separate ports.
- Owner-scoped: every store operation includes `ownerId`.
- No vector search SQL in `MemoryRepository`.
- Personal/small-team scale first (~5k–10k vectors).

## Alternatives

### Option A — D1 table `memory_embeddings` with `vector_json` TEXT

- Pros: No new infra; same deploy as today; fast Phase 5 delivery.
- Cons: ~5–10k vector ceiling; row size; not ideal for similarity at scale.

### Option B — Cloudflare Vectorize from day one

- Pros: Native CF; built for similarity search.
- Cons: New dependency; adapter work; dev/local harder.

### Option C — Postgres + pgvector (skip D1 vectors)

- Pros: Best long-term scale.
- Cons: Requires Postgres metadata path (ADR-004); large jump for Phase 5.

## Decision

**Adopt Option A for MVP** with strict port boundary:

- Table `memory_embeddings` in D1 (see Phase 5 design).
- `D1EmbeddingStore` implements `IEmbeddingStore` including `searchSimilar` (in-process cosine or D1 JSON scan for MVP scale).
- `embedding_id` on `memories` points to store id.
- Document scale ceiling in ARCHITECTURE; swap to Vectorize/pgvector via new adapter **without** changing job runner or provider.

## Tradeoffs

- **Gain:** Phase 5 shippable on current stack; ports prove design.
- **Accept:** Similarity search O(n) per owner acceptable until ~10k vectors.
- **Accept:** Future adapter swap required for enterprise scale (planned, not emergency).

## Migration

1. M5a: `CREATE TABLE memory_embeddings` + indexes.
2. Implement `NoopEmbeddingProvider`, `D1EmbeddingStore`, `EmbeddingJobRunner`.
3. M5c: `npm run db:backfill-embeddings` (batch, idempotent, `content_hash` skip).
4. `IMemoryWriter.applyEmbeddingBackfill` sets `embedding_id`.

## Rollback

- Stop backfill job.
- Drop `memory_embeddings` table (vectors only).
- Set `embedding_id` NULL on memories (metadata intact).

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | **Unblocks implementation** |
| 6 Hybrid Retrieval | `VectorRetrievalCandidateSource` uses `IEmbeddingStore.searchSimilar` |
| 7 Agent Runtime | No direct impact |
| 8 Knowledge Graph | Orthogonal |
| 9 Multi AI | Store queries scoped per [ADR-002](002-workspace-identity-model.md) |
| 10 Enterprise | Plan Vectorize/pgvector adapter; D1 MVP not enterprise scale |

---

## References

- [archive/PHASE-5-EMBEDDING-DESIGN.md](../archive/PHASE-5-EMBEDDING-DESIGN.md)
- [ADR-001-multi-source-retrieval.md](001-multi-source-retrieval.md)
- [AI_BRAIN_CONSTITUTION.md](../AI_BRAIN_CONSTITUTION.md)
