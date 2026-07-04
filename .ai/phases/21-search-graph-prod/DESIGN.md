# Phase 21 — Search & Graph Production — DESIGN

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-022 Implemented](../../adr/022-search-graph-production-platform.md)

---

## Scope

| Track | Deliverable |
|-------|-------------|
| 21A | Meilisearch incremental/full sync orchestration |
| 21B | Neo4j graph relation sync orchestration |
| 21C | Graph vector seeds flag (`GRAPH_VECTOR_SEEDS_ENABLED`) — reserved |

## Architecture

```
MemoryService (unchanged)
       │
       ▼
  SQL SSOT (memories, memory_relations)
       │
       ├─► MeilisearchIndexSyncer ──► external search index
       └─► Neo4jGraphIndexSyncer ──► external graph engine

SearchGraphOrchestrator + SqlSearchGraphSyncStore
       │
       ▼
REST /api/v1/search-graph/*  (SEARCH_GRAPH_PLATFORM_ENABLED)
```

## Boundaries

- Sync jobs **read** SQL; they do not mutate memory SSOT.
- Active retrieval still governed by `SEARCH_PROVIDER` / `GRAPH_PROVIDER` env (Phase 10).
- Platform enables **ops** even when runtime provider is still SQL/D1.

## Deferred

- Automatic post-commit index hooks (event-driven sync)
- Graph vector seed materialization (21C runtime)
- OpenSearch adapter
