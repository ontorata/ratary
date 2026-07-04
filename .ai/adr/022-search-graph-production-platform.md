# ADR-022: Search & Graph Production Platform (Phase 21)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 10 delivered Meilisearch (ADR-014) and Neo4j (ADR-015) adapters with CLI backfill scripts. Production deployments need **operational sync orchestration** — incremental reindex, run history, watermarks, and admin API — without changing `MemoryService`.

## Problem

- Backfill scripts exist but no **in-process production platform** for scheduled/triggered sync.
- No audit trail for search/graph index freshness.
- Capability manifest lacks search/graph production status.

## Decision

1. `ISearchIndexSyncer` — Meilisearch full/incremental sync (wraps existing backfill lib).
2. `IGraphIndexSyncer` — Neo4j full/incremental relation sync.
3. `ISearchGraphSyncStore` — SQL run history + watermarks.
4. `SearchGraphOrchestrator` — unified job lifecycle.
5. REST `/api/v1/search-graph/*` admin API.
6. Extend `CapabilityManifestBuilder` → `searchGraph` section.

## Constraints

- Default env unchanged: `SEARCH_PROVIDER=sql`, `GRAPH_PROVIDER=d1`.
- Platform gate `SEARCH_GRAPH_PLATFORM_ENABLED=false` — sync API off; adapters unchanged.
- `MemoryService` unchanged — sync reads SSOT SQL only.

## Rollback

`SEARCH_GRAPH_PLATFORM_ENABLED=false` — pre-Phase-21 behavior; CLI backfill scripts still work.

## References

- ADR-014, ADR-015, Phase 10 enterprise adapters, Phase 21 DESIGN
