# ADR-021: Content & Vector Scale Platform (Phase 22)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 10 delivered R2/S3 content offload (ADR-005), pgvector vector store (ADR-011), and embedding batch jobs with CLI backfill scripts. Production deployments need **operational orchestration** for content offload, vector index sync, and embedding jobs — with run history, watermarks, and admin API — without changing `MemoryService`.

## Problem

- Backfill scripts exist but no **in-process production platform** for scheduled/triggered scale jobs.
- No audit trail for content offload / pgvector / embedding job freshness.
- Capability manifest lacks content/vector scale production status.

## Decision

1. `IContentOffloadSyncer` — R2/S3 content offload (wraps `content-offload-backfill.ts`).
2. `IPgvectorIndexSyncer` — pgvector full sync (wraps existing backfill lib).
3. `IEmbeddingJobSyncer` — hardened embedding batch via `EmbeddingJobRunner`.
4. `IContentScaleSyncStore` — SQL run history + watermarks.
5. `ContentScaleOrchestrator` — unified job lifecycle.
6. REST `/api/v1/content-scale/*` admin API.
7. Extend `CapabilityManifestBuilder` → `contentScale` section.

## Constraints

- Default env unchanged: `OBJECT_STORAGE_PROVIDER=inline`, `VECTOR_PROVIDER=d1`, `EMBEDDING_PROVIDER=noop`.
- Platform gate `CONTENT_SCALE_PLATFORM_ENABLED=false` — sync API off; adapters unchanged.
- `MemoryService` unchanged — sync reads SSOT SQL only.

## Rollback

`CONTENT_SCALE_PLATFORM_ENABLED=false` — pre-Phase-22 behavior; CLI backfill scripts still work.

## References

- ADR-005, ADR-011, Phase 10 enterprise adapters, Phase 22 DESIGN
