# ADR-015: Neo4j Graph Store Adapter

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T8)  
**Deciders:** Project owner  

---

## Context

Phase 8 implemented graph-augmented retrieval via `IGraphStore` / `D1GraphAdapter` ([ADR-006](006-igraph-provider.md)). Large graphs may require Neo4j or Memgraph.

## Decision

**Adopt Neo4j as an opt-in graph provider:**

1. `Neo4jGraphStoreAdapter` in `src/infrastructure/graph/neo4j/`
2. Loads owner-scoped edges via Cypher; BFS remains in domain `traverseBidirectional`
3. `GRAPH_PROVIDER=neo4j` + `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` via `createGraphProvider()`
4. `D1GraphAdapter` remains default at `GRAPH_PROVIDER=d1`

Edge sync / dual-write deferred to backfill script.

Default `GRAPH_PROVIDER=d1` unchanged.

## References

- [ADR-006 Graph provider](006-igraph-provider.md)
- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `Neo4jGraphStoreAdapter` | `src/infrastructure/graph/neo4j/neo4j-graph-store.adapter.ts` |
| `D1GraphAdapter` (default) | `src/infrastructure/graph/d1/d1-graph.adapter.ts` |
| Factory | `src/infrastructure/composition/create-graph-provider.ts` |
| Backfill script (deferred prod use) | `scripts/backfill-neo4j.ts` |

**Default:** `GRAPH_PROVIDER=d1`. Edge sync / production cutover deferred to Phase 14.
