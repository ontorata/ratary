# ADR-011: pgvector Vector Store Adapter

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T3)  
**Deciders:** Project owner  

---

## Context

Phase 10 introduced `IVectorStore` and `D1VectorStoreBridge` over D1 in-process embeddings ([ADR-008](008-platform-architecture.md)). D1 vector search does not scale to enterprise corpus sizes ([10-PHASE-STATUS.md](../../.ai/core/architecture/10-PHASE-STATUS.md) T-04).

Hybrid retrieval (ADR-001) consumes vectors via `VectorRetrievalCandidateSource` wired at composition root — domain stays unchanged.

## Problem

Selecting `VECTOR_PROVIDER=pgvector` previously threw at factory. Implementing pgvector without an ADR risks coupling `MemoryRepository` to Postgres-specific SQL or breaking owner/workspace scope semantics.

## Constraints

- `IVectorStore` contract unchanged; scope via `VectorScopeKey.ownerId`.
- No vector SQL inside `MemoryRepository` or `Retriever`.
- Default `VECTOR_PROVIDER=d1` must preserve current behavior and test baseline.
- Constitution: no `RetrieverV2`; adapter lives in `src/infrastructure/vector/pgvector/` only.

## Decision

**Adopt pgvector as an opt-in vector provider:**

1. `PgVectorStoreAdapter` in `src/infrastructure/vector/pgvector/pgvector-store.adapter.ts`
2. `memory_vectors` table with `embedding vector` column; DDL exported from `pgvector.schema.ts`
3. Cosine distance via pgvector `<=>`; score = `1 - distance` for parity with D1 in-process cosine similarity
4. `VECTOR_PROVIDER=pgvector` wired at composition root via `createVectorStore()`
5. Connection resolution:
   - Reuse `DATABASE_URL` pool when `SQL_PROVIDER=postgres` and `PGVECTOR_DATABASE_URL` unset
   - Otherwise `PGVECTOR_DATABASE_URL` or `DATABASE_URL` for dedicated vector Postgres (metadata may remain on D1)

`workspace_id` is stored on upsert for future multi-tenant filters; search currently scopes by `owner_id` only (parity with D1 `D1EmbeddingStore`).

## Parity tolerance

| Aspect | D1 bridge | pgvector |
|--------|-----------|----------|
| Scope filter | `owner_id` | `owner_id` |
| Similarity | In-process cosine | pgvector cosine distance |
| Score | cosine similarity ∈ [-1, 1] | `1 - distance` (approximate cosine similarity) |
| Ranking | Top-k after full scan | Top-k via index (IVFFlat/HNSW ops runbook) |

Contract tests (`ivector-store.contract.ts`) assert behavioral parity at the port level.

## Migration

| Step | Action |
|------|--------|
| 1 | Deploy adapter; keep `VECTOR_PROVIDER=d1` |
| 2 | `CREATE EXTENSION vector`; apply `PGVECTOR_MEMORY_VECTORS_DDL` |
| 3 | Backfill embeddings D1 → `memory_vectors` (script; idempotent — deferred) |
| 4 | Flip `VECTOR_PROVIDER=pgvector` per environment |
| 5 | Rollback: revert flag to `d1` |

## Rollback

Set `VECTOR_PROVIDER=d1`. Postgres vector data retained for forward-fix.

## References

- [ADR-001 Multi-source retrieval](001-multi-source-retrieval.md)
- [ADR-009 PostgreSQL adapter](009-postgresql-metadata-adapter.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `PgVectorStoreAdapter` | `src/infrastructure/vector/pgvector/pgvector-store.adapter.ts` |
| DDL export | `src/infrastructure/vector/pgvector/pgvector.schema.ts` |
| `D1VectorStoreBridge` (default) | wired via `createVectorStore()` |
| Factory | `src/infrastructure/composition/create-vector-store.ts` |
| Contract tests | `tests/infrastructure/contracts/ivector-store.contract.ts` |

**Default:** `VECTOR_PROVIDER=d1`. Backfill D1 → `memory_vectors` deferred to Phase 13.
