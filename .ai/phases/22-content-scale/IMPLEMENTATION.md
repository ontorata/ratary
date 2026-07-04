# Phase 22 — Content & Vector Scale — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-021 Implemented](../../adr/021-content-vector-scale-platform.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 22A | `IContentOffloadSyncer` + R2/S3 adapter | ✅ |
| 22B | `IPgvectorIndexSyncer` + pgvector adapter | ✅ |
| 22C | `IEmbeddingJobSyncer` + `EmbeddingJobRunner` wrapper | ✅ |
| 22D | `IContentScaleSyncStore` + SQL migration | ✅ |
| 22E | `ContentScaleOrchestrator` | ✅ |
| 22F | REST `/content-scale/*` admin API | ✅ |
| 22G | Capabilities `contentScale` section | ✅ |

---

## File map

```
scripts/lib/content-offload-backfill.ts
src/content-scale-platform/
  types/           sync job types
  ports/           IContentOffloadSyncer, IPgvectorIndexSyncer, IEmbeddingJobSyncer, IContentScaleSyncStore
  adapters/        ObjectStorageContentOffloadSyncer, PgvectorIndexSyncer, EmbeddingJobSyncer
  services/        ContentScaleOrchestrator
  builders/        ContentScaleManifestBuilder
src/infrastructure/content-scale-platform/
  sql-content-scale-sync-store.ts
src/composition/create-content-scale-ports.ts
src/controllers/content-scale.controller.ts
src/routes/v1/content-scale.routes.ts
tests/content-scale-platform/
tests/api/content-scale.test.ts
tests/db/content-scale-platform-migration.test.ts
```

Reuses existing backfill logic: `scripts/lib/pgvector-backfill.ts`, `scripts/lib/embedding-backfill.ts` (via `EmbeddingJobRunner`).

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `CONTENT_SCALE_PLATFORM_ENABLED` | `false` | Master gate for admin sync API |
| `CONTENT_OFFLOAD_MIN_BYTES` | `8192` | Minimum content size to offload (22A) |
| `CONTENT_OFFLOAD_CLEAR_INLINE` | `false` | Clear inline content after offload |
| `OBJECT_STORAGE_PROVIDER` | `inline` | Active content storage (Phase 10) |
| `VECTOR_PROVIDER` | `d1` | Active vector retrieval (Phase 10) |
| `EMBEDDING_PROVIDER` | `noop` | Active embedding provider |
| `R2_*` / `S3_*` | — | Required for content offload jobs |
| `PGVECTOR_*` | — | Required for pgvector sync jobs |

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/content-scale/status` | Platform status |
| GET | `/api/v1/content-scale/manifest` | Production manifest |
| GET | `/api/v1/content-scale/sync/runs` | Recent sync runs |
| GET | `/api/v1/content-scale/sync/state/:target` | Watermark (`content` / `pgvector` / `embedding`) |
| POST | `/api/v1/content-scale/sync/content` | R2/S3 content offload (full/incremental) |
| POST | `/api/v1/content-scale/sync/pgvector` | pgvector sync |
| POST | `/api/v1/content-scale/sync/embeddings` | Embedding batch job |

---

## Invariants

- `MemoryService` unchanged
- Default env = pre-Phase-22 behavior
- Inline object storage + D1 vector remain default providers
- CLI backfill scripts preserved (`db:backfill-pgvector`, `db:backfill-embeddings`)
