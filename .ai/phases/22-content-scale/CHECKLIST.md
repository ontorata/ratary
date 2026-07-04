# Phase 22 — CHECKLIST

## ADR & design

- [x] ADR-021 Approved / Implemented
- [x] DESIGN reviewed — sync reads SSOT only
- [x] MemoryService unchanged confirmed

## Ports & adapters

- [x] `IContentOffloadSyncer` + R2/S3 adapter (full/incremental)
- [x] `IPgvectorIndexSyncer` + pgvector adapter
- [x] `IEmbeddingJobSyncer` + EmbeddingJobRunner wrapper
- [x] `IContentScaleSyncStore` + SQL tables
- [x] `ContentScaleOrchestrator`
- [x] `CapabilityManifestBuilder` extended with `contentScale` section

## Production validation

- [x] `OBJECT_STORAGE_PROVIDER=r2|s3` path validated via existing adapter tests
- [x] `VECTOR_PROVIDER=pgvector` path validated via existing adapter tests
- [x] Inline/D1 defaults unchanged
- [ ] Staging cutover evidence — deferred (manual)

## Feature flags

- [x] `CONTENT_SCALE_PLATFORM_ENABLED=false` default
- [x] `CONTENT_OFFLOAD_MIN_BYTES=8192` default
- [x] `CONTENT_OFFLOAD_CLEAR_INLINE=false` default

## Documentation & gate

- [x] `.env.example` updated
- [x] [TESTING.md](TESTING.md) executed
- [x] CLI backfill scripts preserved
