# Phase 21 — Search & Graph Production — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-022 Implemented](../../adr/022-search-graph-production-platform.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 21A | `ISearchIndexSyncer` + Meilisearch adapter | ✅ |
| 21B | `IGraphIndexSyncer` + Neo4j adapter | ✅ |
| 21C | `GRAPH_VECTOR_SEEDS_ENABLED` flag (reserved) | ✅ |
| 21D | `ISearchGraphSyncStore` + SQL migration | ✅ |
| 21E | `SearchGraphOrchestrator` | ✅ |
| 21F | REST `/search-graph/*` admin API | ✅ |
| 21G | Capabilities `searchGraph` section | ✅ |

---

## File map

```
src/search-graph-platform/
  types/           sync job types
  ports/           ISearchIndexSyncer, IGraphIndexSyncer, ISearchGraphSyncStore
  adapters/        MeilisearchIndexSyncer, Neo4jGraphIndexSyncer
  services/        SearchGraphOrchestrator
  builders/        SearchGraphManifestBuilder
src/infrastructure/search-graph-platform/
  sql-search-graph-sync-store.ts
src/composition/create-search-graph-ports.ts
src/controllers/search-graph.controller.ts
src/routes/v1/search-graph.routes.ts
tests/search-graph-platform/
tests/api/search-graph.test.ts
tests/db/search-graph-platform-migration.test.ts
```

Reuses existing backfill logic: `scripts/lib/meilisearch-backfill.ts`, `scripts/lib/neo4j-backfill.ts`.

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `SEARCH_GRAPH_PLATFORM_ENABLED` | `false` | Master gate for admin sync API |
| `GRAPH_VECTOR_SEEDS_ENABLED` | `false` | Reserved graph vector seeds (21C) |
| `SEARCH_PROVIDER` | `sql` | Active lexical retrieval (Phase 10) |
| `GRAPH_PROVIDER` | `d1` | Active graph traversal (Phase 10) |
| `MEILISEARCH_*` | — | Required for search sync jobs |
| `NEO4J_*` | — | Required for graph sync jobs |

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/search-graph/status` | Platform status |
| GET | `/api/v1/search-graph/manifest` | Production manifest |
| GET | `/api/v1/search-graph/sync/runs` | Recent sync runs |
| GET | `/api/v1/search-graph/sync/state/:target` | Watermark (`meilisearch` / `neo4j`) |
| POST | `/api/v1/search-graph/sync/search` | Meilisearch sync (full/incremental) |
| POST | `/api/v1/search-graph/sync/graph` | Neo4j sync (full/incremental) |

---

## Invariants

- `MemoryService` unchanged
- Default env = pre-Phase-21 behavior
- D1 graph + SQL search remain default providers
