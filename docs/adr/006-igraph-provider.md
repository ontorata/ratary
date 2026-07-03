# ADR-006: Graph Provider Port (Knowledge Graph Retrieval)

**Status:** Approved  
**Date:** 2026-07-03  
**Amended:** 2026-07-03 (review clarifications — Option B)  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phases 1–7 are complete. Phase 2.6 introduced flat `memory_relations` CRUD via `MemoryRelationService` / `IMemoryRelationRepository`. Phase 4 introduced `IRetrievalCandidateSource`; Phase 6 added `CompositeRetrievalCandidateSource` with RRF merge for SQL + vector ([ADR-001](001-multi-source-retrieval.md)).

Phase 8 requires **neighborhood expansion** during retrieval — related memories reachable via relations — without migrating to a graph-native database or rewriting `MemoryService`, `Retriever`, or MCP/REST core contracts.

Design reference: [.ai/phases/08-knowledge-graph/DESIGN.md](../../.ai/phases/08-knowledge-graph/DESIGN.md)

Canonical `memory_relations` columns (no rename in Phase 8): `source_memory_id`, `target_memory_id`, `relation`, `owner_id`.

## Problem

Related memories linked by `memory_relations` are invisible to lexical SQL and vector search when the query text does not match neighbor content. Example: a `depends_on` edge from "Auth architecture" → "JWT refresh flow" will not surface "Auth architecture" when the query only matches "JWT refresh" unless traversal follows **incoming** edges as well as outgoing.

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
2. Implement **`D1GraphAdapter`** — owner-scoped **bidirectional BFS** via D1 recursive CTE on `memory_relations`:
   - Expand along **outgoing** edges (`source_memory_id` → `target_memory_id`).
   - Expand along **incoming** edges (`target_memory_id` → `source_memory_id`).
   - Filter `WHERE owner_id = ?` on every hop.
   - Enforce `maxDepth` and `remainingBudget` (see Appendix A).
3. Introduce **`GraphRetrievalCandidateSource`** — implements `IRetrievalCandidateSource` (see Appendix F):
   - Derives **seed memories** from lexical SQL (`findRetrievalCandidates` with cap `GRAPH_SEED_CAP`, default 5) when `filters.query` is present; returns `[]` when query absent.
   - Calls `IGraphProvider.traverseNeighbors` per deduped seed in seed-rank order until **`GRAPH_MAX_NEIGHBORS`** total budget is consumed.
   - **Excludes seed memory IDs** from graph output (seeds already appear via SQL leg).
   - Hydrates via `IMemoryReader.findByIds`; **drops archived** memories (`archived = false` only).
4. Extend **`CompositeRetrievalCandidateSource`** wiring when `GRAPH_RETRIEVAL=true` (default `false`).
5. Extend **RRF config** with `graph` source cap and weight (Appendix B).
6. Refactor **`fetchWithCap`** to map caps by **source role** (`sql` | `vector` | `graph`), not array index (Appendix B).

`IGraphProvider` does **not** implement `IRetrievalCandidateSource` directly — the retrieval adapter wraps the port (same layering as `VectorRetrievalCandidateSource` + `IEmbeddingStore`).

## Tradeoffs

- **Gain:** Graph-augmented recall without relation schema migration or service rewrites.
- **Gain:** Bidirectional BFS surfaces neighbors regardless of edge direction.
- **Gain:** External engines (Neo4j, Neptune, etc.) swap via new adapter implementing `IGraphProvider`.
- **Accept:** D1 recursive CTE is MVP-scale; deep/wide graphs may need external adapter (Phase 10 path).
- **Accept:** Three-source RRF adds latency (mitigate with per-source caps).
- **Accept:** Seed quality depends on lexical match — vector seeds deferred to optional enhancement post-MVP.

## Migration

Implementation order (after ADR **Approved**):

1. **Port + types** — `src/graph/igraph-provider.interface.ts`, traversal types, `GraphCapabilities`.
2. **D1 adapter + tests** — `D1GraphAdapter`: bidirectional CTE on `source_memory_id` / `target_memory_id`, `owner_id` filter, depth cap, `remainingBudget`.
3. **`GraphRetrievalCandidateSource` + tests** — seed strategy, seed exclusion, archived filter, empty-query guard, total neighbor budget.
4. **RRF config + composite fix** — add `graph` to `RRF_CONFIG`; refactor `fetchWithCap` to role-based caps (not index 0 = sql, else vector).
5. **Composition root** — extend `createContextService()` per wiring matrix (Appendix E).
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
| 6 Hybrid Retrieval | Composite extended; RRF gains third source; `fetchWithCap` role-based |
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
  /**
   * Remaining neighbor budget for this traversal call.
   * Adapter returns at most this many neighbors (may be less if graph exhausted).
   * GraphRetrievalCandidateSource decrements a shared budget across seeds.
   */
  remainingBudget: number;
  /** When set, only traverse these relation types. */
  relationTypes?: RelationType[];
}

export interface GraphNeighbor {
  memoryId: string;
  depth: number;
  relationType: RelationType;
  /** Outgoing or incoming edge relative to the hop that discovered this neighbor. */
  direction: 'outgoing' | 'incoming';
}

export interface GraphCapabilities {
  supportsTraversal: true;
  supportsBFS: true;
  supportsBidirectional: true;
  maxTraversalDepth: number;
  maxNeighborsPerRequest: number;
}
```

### D1 CTE notes

- Table: `memory_relations`
- Columns: `source_memory_id`, `target_memory_id`, `relation`, `owner_id`
- Bidirectional: union outgoing hops (`source → target`) and incoming hops (`target → source`) in BFS frontier.
- Adapter uses `D1Client` directly — not `IMemoryRelationRepository` (keeps relation CRUD free of traversal SQL).

## Appendix B: RRF configuration (proposed defaults)

### Per-source caps and weights

When SQL + vector + graph are all enabled:

| Role | `SOURCE_CAPS` | `SOURCE_WEIGHTS` |
|------|---------------|-------------------|
| sql | 40 | 1.0 |
| vector | 40 | 1.0 |
| graph | 30 | 1.0 |

When only SQL + graph (`HYBRID_RETRIEVAL=false`, `GRAPH_RETRIEVAL=true`):

| Role | `SOURCE_CAPS` |
|------|---------------|
| sql | 50 |
| graph | 50 |

Final merge still applies `RETRIEVAL_CANDIDATE_CAP` (100) after RRF dedupe by `memoryId`.

### Composite cap by role (required refactor)

Phase 6 `fetchWithCap` maps index `0` → sql and `1+` → vector. Phase 8 **must** replace this with explicit role mapping:

```typescript
// Each source registered with a role tag or instanceof check
type SourceRole = 'sql' | 'vector' | 'graph';
const cap = RRF_CONFIG.SOURCE_CAPS[role];
```

Sources may appear in any order in the composite array; caps must not depend on array index.

## Appendix C: Environment flags

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAPH_RETRIEVAL` | `false` | Enable graph leg in composite retrieval |
| `GRAPH_MAX_DEPTH` | `2` | BFS depth cap (max 3 for MVP) |
| `GRAPH_SEED_CAP` | `5` | Max lexical seeds per query |
| `GRAPH_MAX_NEIGHBORS` | `30` | **Total** neighbor cap per `findCandidates` call (shared across all seeds) |

`HYBRID_RETRIEVAL` and `GRAPH_RETRIEVAL` are independent — see Appendix E.

## Appendix D: Module layout

```
src/graph/
├── igraph-provider.interface.ts
├── d1-graph.adapter.ts
└── graph-retrieval-candidate-source.ts   # implements IRetrievalCandidateSource
```

`GraphRetrievalCandidateSource` depends on `IGraphProvider` + `IMemoryReader` + seed lookup via `IMemoryReader.findRetrievalCandidates`.

## Appendix E: Composition wiring matrix

| `HYBRID_RETRIEVAL` | `GRAPH_RETRIEVAL` | Composite sources |
|--------------------|-------------------|-------------------|
| `false` | `false` | *(none — default `SqlRetrievalCandidateSource`)* |
| `true` | `false` | `[sql, vector]` |
| `false` | `true` | `[sql, graph]` |
| `true` | `true` | `[sql, vector, graph]` |

Implementation lives in `createContextService()`. Embedding provider/store required only when vector leg is included.

## Appendix F: GraphRetrievalCandidateSource behavior

1. If `!filters.query` → return `[]`.
2. Fetch up to `GRAPH_SEED_CAP` seeds via `findRetrievalCandidates` (same owner/project/tags/levels filters).
3. Initialize `budget = GRAPH_MAX_NEIGHBORS`, `seen = Set<memoryId>` including **all seed IDs**.
4. For each seed in rank order while `budget > 0`:
   - Call `traverseNeighbors(seedId, ownerId, { maxDepth: GRAPH_MAX_DEPTH, remainingBudget: budget, ... })`.
   - Append neighbors not in `seen`; decrement `budget` per new neighbor added to result list.
5. Hydrate unique neighbor IDs via `findByIds`; filter out `archived === true`.
6. Return memories in discovery order (BFS rank across seeds).

Seeds are intentionally excluded from graph leg output to avoid double-counting in RRF (SQL leg already ranks seeds).

---

*Approved — implementation may proceed per Migration section.*
