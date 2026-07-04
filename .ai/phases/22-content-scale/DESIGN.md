# Phase 22 — Content & Vector Scale — DESIGN

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-021 Implemented](../../adr/021-content-vector-scale-platform.md)

---

## Scope

| Track | Deliverable |
|-------|-------------|
| 22A | **R2/S3 content offload** — large inline content → object storage |
| 22B | **pgvector production sync** — D1 embeddings → external vector store |
| 22C | **Embedding job hardening** — orchestrated batch embedding via `EmbeddingJobRunner` |

## Architecture

```
MemoryService (unchanged)
       │
       ▼
  SQL SSOT (memories, memory_embeddings)
       │
       ├─► ObjectStorageContentOffloadSyncer ──► R2/S3 (object_key)
       ├─► PgvectorIndexSyncer ──► pgvector store
       └─► EmbeddingJobSyncer ──► EmbeddingJobRunner

ContentScaleOrchestrator + SqlContentScaleSyncStore
       │
       ▼
REST /api/v1/content-scale/*  (CONTENT_SCALE_PLATFORM_ENABLED)
```

## Boundaries

- Sync jobs **read** SQL (and write `object_key` / external indexes only); they do not change `MemoryService` write paths.
- Active retrieval still governed by `OBJECT_STORAGE_PROVIDER`, `VECTOR_PROVIDER`, `EMBEDDING_PROVIDER` env (Phase 10).
- Platform enables **ops orchestration** even when runtime providers are still inline/D1.

## Deferred

- Automatic post-write content offload hooks (event-driven)
- Inline content clearing policy beyond `CONTENT_OFFLOAD_CLEAR_INLINE` flag
- Cross-region object storage replication
