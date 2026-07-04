# Phase 21 — CHECKLIST

## ADR & design

- [x] ADR-022 Approved / Implemented
- [x] DESIGN reviewed — sync reads SSOT only
- [x] MemoryService unchanged confirmed

## Ports & adapters

- [x] `ISearchIndexSyncer` + Meilisearch adapter (full/incremental)
- [x] `IGraphIndexSyncer` + Neo4j adapter (full/incremental)
- [x] `ISearchGraphSyncStore` + SQL tables
- [x] `SearchGraphOrchestrator`
- [x] `CapabilityManifestBuilder` extended with `searchGraph` section

## Production validation

- [x] `SEARCH_PROVIDER=meilisearch` path validated via existing adapter tests
- [x] `GRAPH_PROVIDER=neo4j` path validated via existing adapter tests
- [x] D1/SQL defaults unchanged
- [ ] Staging cutover evidence — deferred (manual)

## Feature flags

- [x] `SEARCH_GRAPH_PLATFORM_ENABLED=false` default
- [x] `GRAPH_VECTOR_SEEDS_ENABLED=false` default (21C reserved)

## Documentation & gate

- [x] `.env.example` updated
- [x] [TESTING.md](TESTING.md) executed
- [x] CLI backfill scripts preserved
