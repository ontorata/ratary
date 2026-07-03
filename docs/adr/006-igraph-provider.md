# ADR-006: Graph Provider Port (Knowledge Graph Retrieval)

**Status:** Proposed  
**Date:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phases 1–7 are complete. Phase 2.6 introduced flat `memory_relations` CRUD via `MemoryRelationService` / `IMemoryRelationRepository`. Phase 4 introduced `IRetrievalCandidateSource`; Phase 6 added `CompositeRetrievalCandidateSource` with RRF merge for SQL + vector ([ADR-001](001-multi-source-retrieval.md)).

Phase 8 requires **neighborhood expansion** during retrieval — related memories reachable via relations — without migrating to a graph-native database or rewriting `MemoryService`, `Retriever`, or MCP/REST core contracts.

Design reference: [.ai/phases/08-knowledge-graph/DESIGN.md](../../.ai/phases/08-knowledge-graph/DESIGN.md)

## Problem

Related memories linked by `memory_relations` are invisible to lexical SQL and vector search when the query text does not match neighbor content. Example: an `depends_on` edge from "Auth architecture" → "JWT refresh flow" will not surface the neighbor unless the query hits both titles.

Options that violate constitution:

- Adding recursive graph SQL to `MemoryRepository` couples metadata CRUD to traversal.
- Replacing `MemoryRelationRepository` with a graph engine breaks flat relation CRUD and Phase 2.6 API stability.
- Rewriting `Retriever` or `ContextService` per source repeats the Phase 6 mistake ADR-001 avoided.

## Constraints

- [ADR-001](001-multi-source-retrieval.md): third retrieval leg plugs into `CompositeRetrievalCandidateSource`; no `RetrieverV2`.
- `IRetrievalCandidateSource.findCandidates` signature unchanged.
- `MemoryRelationService` API and `memory_relations` schema unchanged in Phase 8.
- No graph SQL inside `MemoryRepository` or `IMemoryRelationRepository` business methods — traversal lives behind `IGraphProvider`.
- Owner scoping on every traversal and hydration (`ownerId` required).
- MCP/REST **core** tools from Phases 1–7 unchanged; new graph endpoints/tools are **additive only** (optional follow-on).
- No `*V2` parallel implementations.
- One concern per commit during implementation.

## Alternatives

### Option A — `IGraphProvider` port + `GraphRetrievalCandidateSource` as composite third leg

- Pros: Matches ADR-001 pattern (same as vector); D1 CTE MVP; external graph adapter swap path; unit-testable layers.
- Cons: Requires seed strategy for traversal; RRF cap rebalancing across three sources.

### Option B — Extend `SqlRetrievalCandidateSource` with JOIN on `memory_relations`

- Pros: Single source; no new port.
- Cons: Couples lexical SQL to graph shape; breaks when external graph engine replaces D1; violates storage replaceability.

### Option C — New `GraphService` orchestrator above `ContextService`

- Pros: Flexible per-request traversal policies.
- Cons: Orchestrator knows persistence; duplicates merge logic; breaks layer boundary.

### Option D — External graph database in Phase 8 MVP

- Pros: Native traversal performance at scale.
- Cons: New infra dependency; over-scoped for MVP; flat relations already in D1.

## Decision

**Adopt Option A:**

1. Introduce **`IGraphProvider`** — read-only traversal port over flat relations (no writes).
2. Implement **`D1GraphAdapter`** — owner-scoped BFS via D1 recursive CTE on `memory_relations` (depth and neighbor caps enforced in adapter).
3. Introduce **`GraphRetrievalCandidateSource`** — implements `IRetrievalCandidateSource`:
   - Derives **seed memories** from lexical SQL (`findRetrievalCandidates` with small cap, default 5) when `filters.query` is present; returns `[]` when query absent (same guard as vector source).
   - Calls `IGraphProvider.traverseNeighbors` per deduped seed.
   - Hydrates results via `IMemoryReader.findByIds`, preserving traversal rank order.
4. Extend **`CompositeRetrievalCandidateSource`** wiring in composition root when `GRAPH_RETRIEVAL=true` (default `false`).
5. Extend **RRF config** with `graph` source cap and weight (see Appendix).

`IGraphProvider` does **not** implement `IRetrievalCandidateSource` directly — the retrieval adapter wraps the port (same layering as `VectorRetrievalCandidateSource` + `IEmbeddingStore`).

## Tradeoffs

- **Gain:** Graph-augmented recall without relation schema migration or service rewrites.
- **Gain:** External engines (Neo4j, Neptune, etc.) swap via new adapter implementing `IGraphProvider`.
- **Accept:** D1 CTE traversal is MVP-scale; deep/wide graphs may need external adapter (Phase 10 path).
- **Accept:** Three-source RRF adds latency (mitigate with per-source caps).
- **Accept:** Seed quality depends on lexical match — vector seeds deferred to optional enhancement post-MVP.

## Migration

Implementation order (after ADR **Approved**):

1. **Port + types** — `src/graph/igraph-provider.interface.ts`, traversal types, `GraphCapabilities`.
2. **D1 adapter + tests** — `D1GraphAdapter`: owner filter, depth cap, neighbor cap, relation-type filter.
3. **`GraphRetrievalCandidateSource` + tests** — seed strategy, hydration, empty-query guard.
4. **RRF config** — add `graph` to `RRF_CONFIG.SOURCE_CAPS` and `SOURCE_WEIGHTS`; update composite cap logic for three sources.
5. **Composition root** — extend `createContextService()` / `server.ts` / `mcp/server.ts` behind `GRAPH_RETRIEVAL=true`.
6. **Optional additive API** (separate commits, not blocking core gate):
   - MCP: `get_graph_capabilities`, `traverse_relations`
   - REST: `GET /api/v1/graph/capabilities`, `POST /api/v1/graph/traverse`

No schema migration — `memory_relations` unchanged.

## Rollback

- Set `GRAPH_RETRIEVAL=false` or remove graph leg from composite array.
- Delete `src/graph/` module; no data migration required.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | Unchanged |
| 6 Hybrid Retrieval | Composite extended; RRF gains third source |
| 7 Agent Runtime | Unchanged; agents consume same context API |
| 8 Knowledge Graph | **Primary enabler** |
| 9 Multi-AI | Traversal filters add `workspaceId` when column live ([ADR-002](002-workspace-identity-model.md)); port signature additive only |
| 10 Enterprise | `Neo4jGraphAdapter` (or similar) replaces `D1GraphAdapter`; audit via optional `graph.traversed` events |

---

## References

- [ADR-001: Multi-Source Retrieval](001-multi-source-retrieval.md)
- [ADR-002: Workspace Identity Model](002-workspace-identity-model.md)
- [ADR-004: Repository Port Types](004-repository-port-types.md)
- [Phase 8 DESIGN](../../.ai/phases/08-knowledge-graph/DESIGN.md)
- [POLICY.md](POLICY.md)

---

## Appendix A: Port contract (proposed)

```typescript
/** Read-only graph traversal over flat memory_relations. */
export interface IGraphProvider {
  traverseNeighbors(
    seedMemoryId: string,
    ownerId: string,
    options: GraphTraversalOptions,
  ): Promise<GraphNeighbor[]>;

  getCapabilities(): GraphCapabilities;
}

export interface GraphTraversalOptions {
  /** Maximum BFS depth from seed (default: 2, max: 3 for MVP). */
  maxDepth: number;
  /** Hard cap on neighbors returned for this seed (default: 20). */
  maxNeighbors: number;
  /** When set, only traverse these relation types. */
  relationTypes?: RelationType[];
}

export interface GraphNeighbor {
  memoryId: string;
  depth: number;
  relationType: RelationType;
}

export interface GraphCapabilities {
  supportsTraversal: true;
  supportsBFS: true;
  maxTraversalDepth: number;
  maxNeighbors: number;
}
```

## Appendix B: RRF configuration (proposed defaults)

When SQL + vector + graph are all enabled:

| Source | `SOURCE_CAPS` | `SOURCE_WEIGHTS` |
|--------|---------------|-------------------|
| sql | 40 | 1.0 |
| vector | 40 | 1.0 |
| graph | 30 | 1.0 |

Final merge still applies `RETRIEVAL_CANDIDATE_CAP` (100) after RRF dedupe by `memoryId`.

When only SQL + graph (`HYBRID_RETRIEVAL=false`, `GRAPH_RETRIEVAL=true`):

| Source | `SOURCE_CAPS` |
|--------|---------------|
| sql | 50 |
| graph | 50 |

## Appendix C: Environment flags

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAPH_RETRIEVAL` | `false` | Enable graph leg in composite retrieval |
| `GRAPH_MAX_DEPTH` | `2` | BFS depth cap for D1 adapter |
| `GRAPH_SEED_CAP` | `5` | Max lexical seeds per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | Total neighbor cap per retrieval request |

Independent of `HYBRID_RETRIEVAL` — graph leg can run with SQL-only or full hybrid.

## Appendix D: Module layout

```
src/graph/
├── igraph-provider.interface.ts
├── d1-graph.adapter.ts
└── graph-retrieval-candidate-source.ts   # implements IRetrievalCandidateSource
```

`GraphRetrievalCandidateSource` depends on `IGraphProvider` + `IMemoryReader` + seed lookup via `IMemoryReader.findRetrievalCandidates`.
