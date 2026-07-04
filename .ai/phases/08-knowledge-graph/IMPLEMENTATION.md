# Phase 8 — Knowledge Graph — IMPLEMENTATION

**Document:** IMPLEMENTATION  
**Phase status:** Closed  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Summary

Implemented ADR-006 Option A: `IGraphProvider` port, D1 bidirectional BFS adapter, graph retrieval composite leg, role-based RRF caps, composition wiring, and additive MCP/REST graph API.

---

## Modules

| Module | Path | Role |
|--------|------|------|
| Port | `src/graph/igraph-provider.interface.ts` | Read-only traversal contract |
| Pure BFS | `src/graph/traversal.ts` | Bidirectional BFS (unit-testable) |
| D1 adapter | `src/infrastructure/graph/d1/d1-graph.adapter.ts` | Owner-scoped edge load + in-process BFS (MVP) |
| Neo4j adapter | `src/infrastructure/graph/neo4j/neo4j-graph-store.adapter.ts` | Opt-in external graph store (ADR-015) |
| Provider factory | `src/infrastructure/composition/create-graph-provider.ts` | `GRAPH_PROVIDER=d1\|neo4j` |
| Re-export | `src/graph/d1-graph.adapter.ts` | Backward-compatible shim |
| Retrieval leg | `src/graph/graph-retrieval-candidate-source.ts` | Seeds → traverse → hydrate (Appendix F) |
| Config defaults | `src/graph/graph.config.ts` | Depth/seed/neighbor defaults |
| Graph service | `src/services/graph.service.ts` | Capabilities + traverse API (archived filter) |
| Controller | `src/controllers/graph.controller.ts` | REST handlers |
| Routes | `src/routes/v1/graph.routes.ts` | `/graph/capabilities`, `/graph/traverse` |
| RRF roles | `src/memory/retrieval-source.types.ts` | `RegisteredRetrievalSource` |
| Composite | `src/memory/composite-retrieval-candidate-source.ts` | Role-based `getRrfSourceCap()` |
| Wiring | `src/memory/create-context-service.ts` | Appendix E matrix |
| Env | `src/config/env.ts` | `GRAPH_*` flags |

---

## Commit sequence (ADR-006 migration)

| Step | Commit theme |
|------|----------------|
| 1 | `IGraphProvider` port + graph config |
| 2 | `D1GraphAdapter` + `traverseBidirectional` |
| 3 | `GraphRetrievalCandidateSource` |
| 4 | Role-based RRF caps + `graph` source |
| 5 | `createContextService()` wiring + env |
| 6 | MCP/REST graph endpoints |
| 7 | Gate fixes (cross-owner, docs, archived filter) |

---

## Feature flags

| Variable | Default | Effect |
|----------|---------|--------|
| `GRAPH_RETRIEVAL` | `false` | Enable graph leg in composite retrieval |
| `GRAPH_PROVIDER` | `d1` | `d1` (in-process BFS) or `neo4j` |
| `GRAPH_MAX_DEPTH` | `2` | BFS depth (max 3) |
| `GRAPH_SEED_CAP` | `5` | Lexical seeds per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Total neighbor budget per `findCandidates` |
| `NEO4J_URI` / `NEO4J_USERNAME` / `NEO4J_PASSWORD` | — | Required when `GRAPH_PROVIDER=neo4j` |
| `HYBRID_RETRIEVAL` | `false` | Independent — vector leg when true + embedding deps |
| `GRAPH_VECTOR_SEEDS_ENABLED` | `false` | Vector seed hints for graph platform (Phase 21) |

---

## Wiring matrix (Appendix E)

| HYBRID | GRAPH | Composite |
|--------|-------|-----------|
| false | false | Default `SqlRetrievalCandidateSource` |
| true | false | sql + vector |
| false | true | sql + graph |
| true | true | sql + vector + graph |

---

## Accepted MVP tradeoffs

- D1 adapter loads all owner edges per traverse (in-process BFS, not SQL CTE) — swap via `GRAPH_PROVIDER=neo4j` or Phase 21 sync.
- Graph recall requires `GRAPH_RETRIEVAL=true`; explore API always available via `GraphService`.
- Deep multi-hop explore: MCP `traverse_relations` (depth 1–3); context assembly uses one-hop expansion (Phase 6.5) + composite graph leg.

---

## Post-gate extensions (successor phases)

| Phase | Module | Role |
|-------|--------|------|
| **6.5** | `relation-context-expander.ts` | One-hop relation summaries in context pipeline |
| **8.7** | `src/memory/relation-inference/` | Inferred edges augment traverse graph |
| **21** | `src/search-graph-platform/` | Meilisearch + Neo4j index sync orchestration |
| **04.7** | `GraphRepairTask` | Stewardship graph repair stage |

---

*Read-only at phase gate PASS.*
