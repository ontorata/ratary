# Phase 8 � Knowledge Graph � DESIGN

**Document:** DESIGN  
**Phase status:** ? Closed � gate PASS (2026-07-03)  
**Platform snapshot:** 2026-07-04 � Neo4j adapter, successor phases 6.5 / 8.7 / 21 documented in �19  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)

---

## 1. Purpose

Define the integration of a Knowledge Graph layer into the Ratary memory foundation through the `IGraphProvider` port pattern.

Phase 8 adds:
- Graph traversal capabilities via `IGraphProvider`
- Graph-augmented retrieval as third leg of composite retrieval
- Traversal-based neighborhood expansion within retrieval cap

Phase 8 does **not** modify:
- `MemoryRelationService` API
- `MemoryRelationRepository` (flat relations remain)
- Core `MemoryService` implementation
- Existing MCP or REST contracts

This phase is **implementation-ready design**. The document defines the port contract, adapter pattern, and integration points without touching existing stable services.

---

## 2. Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| `IGraphProvider` port | ? Implemented |
| D1 in-process BFS adapter | ? Implemented |
| Neo4j adapter (opt-in) | ? Post-gate � `GRAPH_PROVIDER=neo4j` |
| Graph retrieval candidate source | ? Implemented |
| Composite retrieval extension | ? Phase 6 pattern |
| Flat `memory_relations` | ? Phase 2.6 unchanged |

### Outside this repository

| Capability | Location |
|------------|----------|
| Neptune / Dgraph / Memgraph adapters | Future � port pattern only |
| GraphQL API | External service |
| Graph visualization | External tooling |

### Phase 8 deliverables

1. `IGraphProvider` port contract
2. D1 in-process BFS adapter (owner-scoped edge load)
3. Graph retrieval candidate source
4. Neighborhood expansion within retrieval cap
5. Composite retrieval integration

---

## 3. Architecture Overview

Phase 8 extends the retrieval pipeline with a graph traversal layer:

```
+-----------------------------------------------------------------------------+
�                         Retrieval Pipeline (Phase 8)                          �
�                                                                              �
�  +-----------------------------------------------------------------------+   �
�  �                    CompositeRetrievalCandidateSource                      �   �
�  �                                                                        �   �
�  �  +-----------------+  +-----------------+  +---------------------+  �   �
�  �  �  SQL Source     �  �  Vector Source  �  �  Graph Source      �  �   �
�  �  � (Phase 4)      �  �  (Phase 5-6)    �  �  (Phase 8 NEW)    �  �   �
�  �  +-----------------+  +-----------------+  +---------------------+  �   �
�  �                                                                        �   �
�  +-----------------------------------------------------------------------+   �
�                                    �                                           �
�                                    ?                                           �
�  +-----------------------------------------------------------------------+   �
�  �                    Ranker ? ContextBuilder ? Output                    �   �
�  +-----------------------------------------------------------------------+   �
+-----------------------------------------------------------------------------+
```

### Design invariants

1. **Flat relations unchanged** � `memory_relations` table remains; no migration to graph-native format.
2. **Graph is a retrieval adapter** � `GraphRetrievalCandidateSource` implements `IRetrievalCandidateSource` and wraps `IGraphProvider`.
3. **Neighborhood expansion bounded** � Traversal depth limited by context cap.
4. **No graph-native storage** � adapters query flat `memory_relations` (in-process BFS or Neo4j index).
5. **Port pattern preserved** � `IGraphProvider` swappable for external graph engine.

---

## 4. Architecture Diagram

```
+-----------------------------------------------------------------------------+
�                    Retrieval Pipeline � Full View                             �
+-----------------------------------------------------------------------------+

                         Query: "How do I authenticate?"
                                    �
                                    ?
+-----------------------------------------------------------------------------+
�                     CompositeRetrievalCandidateSource                          �
�                                                                              �
�  +------------------+   +------------------+   +----------------------+    �
�  � SqlRetrieval     �   � VectorRetrieval  �   � GraphRetrieval      �    �
�  � CandidateSource   �   � CandidateSource  �   � CandidateSource     �    �
�  �                  �   �                  �   �                     �    �
�  � � Keyword match  �   � � Cosine sim    �   � � BFS from seed   �    �
�  � � Title boost    �   � � Top-k by dist �   � � N-hop neighbors �    �
�  � � Recency boost  �   � � Owner filter  �   � � Relation types   �    �
�  +------------------+   +------------------+   +----------------------+    �
�           �                      �                      �                    �
�           +----------------------+----------------------+                    �
�                                  �                                           �
+----------------------------------+-------------------------------------------+
                                   �
                                   ?
+-----------------------------------------------------------------------------+
�                          Ranker (RRF Fusion)                                 �
�                                                                              �
�  � Reciprocal Rank Fusion across sources                                    �
�  � Deduplication by memoryId                                                �
�  � Configurable source weights                                              �
�  � Cap at configurable limit (default: 20)                                 �
+-----------------------------------------------------------------------------+
                                   �
                                   ?
+-----------------------------------------------------------------------------+
�                         ContextBuilder                                       �
�                                                                              �
�  � Bounded by token budget (default: 4096)                                  �
�  � Assembles memories + summary + relations                                 �
+-----------------------------------------------------------------------------+
```

### Graph traversal flow

```
+-----------------------------------------------------------------------------+
�                        IGraphProvider Traversal                                �
+-----------------------------------------------------------------------------+

  Seed Memory ID          Relation Type        Depth Limit
        �                      �                   �
        ?                      ?                   ?
+-----------------------------------------------------------------------------+
�                           traverseNeighbors()                                 �
�                                                                              �
�   D1 CTE Query (bidirectional BFS � see ADR-006):                            �
�   Canonical columns: source_memory_id, target_memory_id, relation, owner_id �
�   WITH RECURSIVE graph AS (                                                 �
�     -- outgoing: source ? target                                            �
�     SELECT target_memory_id, relation, 1 AS depth                           �
�     FROM memory_relations                                                   �
�     WHERE source_memory_id = ? AND owner_id = ?                           �
�     UNION ALL                                                               �
�     -- incoming: target ? source                                            �
�     SELECT source_memory_id, relation, 1 AS depth                           �
�     FROM memory_relations                                                   �
�     WHERE target_memory_id = ? AND owner_id = ?                             �
�     UNION ALL                                                               �
�     SELECT ... (recursive hops, depth < GRAPH_MAX_DEPTH)                    �
�   )                                                                          �
�   SELECT DISTINCT memory_id FROM graph                                      �
+-----------------------------------------------------------------------------+
                                   �
                                   ?
                            Memory IDs (bounded)
```

---

## 5. Layer Responsibilities

### Layer assignment for graph integration

| Layer | Responsibility | Forbidden |
|-------|---------------|-----------|
| **Transport** | Additive graph endpoints under `/api/v1/graph/`; MCP graph tools | Breaking changes to Phase 1�7 routes/tools |
| **Controllers** | Thin handlers delegating to `GraphService` | Traversal logic in controllers |
| **Application Services** | `GraphService` for explore API; retrieval via existing services | Duplicating RRF merge |
| **Retrieval** | Graph source integration | Direct relation queries in retriever |
| **Domain** | Traversal algorithms (pure) | I/O |
| **Persistence** | `IGraphProvider` adapter | Business rules |

### Ratary responsibilities (Phase 8)

| Concern | Owner | Change |
|---------|-------|--------|
| Memory CRUD | `MemoryService` | None |
| Relation CRUD | `MemoryRelationService` | None |
| Composite retrieval | `CompositeRetrievalCandidateSource` | Add graph leg |
| Graph traversal | `IGraphProvider` | **NEW** |
| Deduplication | `Ranker` | None |

---

## 6. Repository Boundary

### What Phase 8 adds

```
src/
+-- graph/
�   +-- ports/
�   �   +-- IGraphProvider.ts       # Port interface
�   +-- adapters/
�   �   +-- D1GraphAdapter.ts      # D1 CTE implementation
�   �   +-- FutureGraphAdapter.ts   # External graph engine (future)
�   +-- retrieval/
�   �   +-- GraphRetrievalCandidateSource.ts  # Implements IRretrievalCandidateSource
�   +-- domain/
�       +-- traversal.ts             # Pure traversal algorithms
```

### What Phase 8 does NOT modify

```
# Do not change:
src/
+-- services/MemoryService.ts       # No changes
+-- services/MemoryRelationService.ts # API unchanged
+-- repositories/MemoryRepository.ts  # No changes
+-- repositories/RelationRepository.ts # Flat relations unchanged
```

### Forbidden in Phase 8

```
# Forbidden inside src/graph/
+-- graph-native-storage/           # No graph database in Phase 8
+-- graph-ql/                       # No GraphQL API
+-- graph-visualization/            # No visualization tools
+-- traversal-caching/             # No caching layer
```

---

## 7. External Graph Boundary

### Port definition only

Phase 8 defines the `IGraphProvider` port; no external graph database is required.

```
+---------------------------------------------------------+
�                  IGraphProvider Port                     �
+---------------------------------------------------------�
�                                                          �
�  Current: D1GraphAdapter (in-process BFS on flat relations)     �
�  Opt-in:  Neo4jGraphStoreAdapter (`GRAPH_PROVIDER=neo4j`)       �
�  Future:  Neptune / Dgraph / Memgraph adapters                  �
�                                                          �
+---------------------------------------------------------+
```

### Future external graph engines

| Engine | Adapter | Wire | Status | Track |
|--------|---------|------|--------|-------|
| D1 / SQL flat edges | `D1GraphAdapter` | SQL | ? Default (`GRAPH_PROVIDER=d1`) | Phase 8 |
| Neo4j | `Neo4jGraphStoreAdapter` | Bolt / Cypher | ? Opt-in (`GRAPH_PROVIDER=neo4j`) | Post-gate |
| Amazon Neptune | `NeptuneGraphAdapter` | HTTP / Gremlin | ?? Future | **D8-03** |
| Dgraph | `DgraphGraphAdapter` | gRPC / GraphQL� | ?? Future | **D8-03** |
| Memgraph | `MemgraphGraphAdapter` | Bolt | ?? Future | **D8-03** |

New engines implement `IGraphProvider` and register in `createGraphProvider()` � no changes to `GraphService`, composite retrieval, or relation CRUD.

---

## 8. Ratary Graph Protocol

### Protocol definition

The `IGraphProvider` port defines the graph traversal contract.

```
+------------------------------------------------------------+
�                    IGraphProvider Protocol                  �
�                                                            �
�  Interface: TypeScript port                                 �
�  Implementation: D1 in-process BFS (default) + Neo4j (opt-in) �
�  Future: Additional external graph adapters                    �
�  Contract: Traversal results only; no storage writes       �
�                                                            �
+------------------------------------------------------------+
```

---

## 9. Protocol Version

### Versioning within Phase 8

| Version aspect | Policy |
|--------------|--------|
| `IGraphProvider` | Stable once defined; no breaking changes |
| D1 BFS algorithm | Versioned in adapter |
| External adapters | Follow adapter versioning |

### Breaking change policy

1. **Port methods** � Never remove; only add optional parameters.
2. **Adapter implementations** � Versioned internally.
3. **Traversal results** � Additive fields only.

---

## 10. Capability Negotiation

### Graph capability discovery

```typescript
interface GraphCapabilities {
  supportsTraversal: boolean;           // Always true in Phase 8
  supportsBFS: boolean;                // Always true
  supportsDFS: boolean;                // Optional
  supportsWeightedTraversal: boolean; // Optional (Phase 9)
  maxTraversalDepth: number;           // Configurable (default: 3)
  maxNeighbors: number;                // Bounded by context cap
}
```

### Capability endpoints

| Endpoint | Returns | Notes |
|----------|---------|-------|
| `GET /api/v1/graph/capabilities` | Graph capabilities | REST |
| MCP `get_graph_capabilities` | Graph capabilities | MCP |

---

## 11. Stable MCP Contracts

### New MCP tools (Phase 8)

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| `get_graph_capabilities` | `{}` | `{ capabilities }` | Discover graph features |
| `traverse_relations` | `{ memoryId, depth?, types? }` | `{ memoryIds[], neighbors[] }` | Graph traversal (explore API; archived neighbors excluded) |

### Unchanged MCP tools

All Phase 1-7 MCP tools remain unchanged in Phase 8.

### MCP tool schema rules

1. **New tools are additive** � No existing tools modified.
2. **Traversal results bounded** � Enforced by adapter.
3. **Error responses** � Standard shape: `{ error, message, code }`.

---

## 12. Stable REST Contracts

### New REST endpoints (Phase 8)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `GET` | `/api/v1/graph/capabilities` | Graph capabilities | Required |
| `POST` | `/api/v1/graph/traverse` | Traverse relations | Required |

### Unchanged REST endpoints

All Phase 1-7 REST endpoints remain unchanged in Phase 8.

### REST contract rules

1. **Path structure** � Graph endpoints under `/api/v1/graph/`.
2. **Response format** � `{ data, meta? }` for success; `{ error, message, details? }` for errors.
3. **Pagination** � Not applicable for traversal; results bounded by adapter.

---

## 13. Compatibility Matrix

### Phase compatibility

| Phase | Graph Source | Composite | Notes |
|-------|--------------|-----------|-------|
| 4 | ? None | SQL only | Foundation |
| 5 | ? None | SQL only | Embedding added |
| 6 | ? None | SQL + Vector | Hybrid added |
| **7** | ? None | SQL + Vector | Boundary defined |
| **8** | ? D1 BFS (+ Neo4j opt-in) | SQL + Vector + Graph | Phase 8 gate |
| **6.5** | ? + one-hop relations stage | Progressive retrieval plan | Context assembly |
| **8.7** | ? Inferred edges | Same traverse port | ADR-041 |
| 9 | ? | + workspace scope on memories | Owner-scoped traverse |
| 10 | ? | + org RBAC opt-in | Adapters unchanged |
| **21** | ? Sync platform | Meilisearch + Neo4j indexes | ADR-022; vector seeds reserved 21C |

### External graph engine compatibility

| Engine | REST / MCP traverse | Adapter (planned or live) | Wire protocol | `IGraphProvider` | Status | Owner / notes |
|--------|---------------------|---------------------------|---------------|------------------|--------|---------------|
| D1 in-process BFS | ? | `D1GraphAdapter` | SQL flat edges | ? Implemented | ? **Default** | `GRAPH_PROVIDER=d1` |
| Neo4j | ? | `Neo4jGraphStoreAdapter` | Bolt / Cypher | ? Implemented | ? **Opt-in** | `GRAPH_PROVIDER=neo4j` + credentials |
| Amazon Neptune | ? (via same graph API) | `NeptuneGraphAdapter` | HTTP / Gremlin | ?? Not built | ?? **Future** | **D8-03** � port pattern only |
| Dgraph | ? (via same graph API) | `DgraphGraphAdapter` | gRPC / GraphQL� | ?? Not built | ?? **Future** | **D8-03** � port pattern only |
| Memgraph | ? (via same graph API) | `MemgraphGraphAdapter` | Bolt (Neo4j-compatible) | ?? Not built | ?? **Future** | **D8-03** � port pattern only |

**Runtime factory:** `createGraphProvider()` in `src/infrastructure/composition/create-graph-provider.ts` � implements `d1` and `neo4j` only; unknown `GRAPH_PROVIDER` values fail fast at startup.

**Mitigation while D8-03 open:** production scale ? Neo4j adapter + Phase 21 sync (`IndexRepairTask` / `GraphRepairTask`); zero-ops ? D1 default.

### Deferred track (post-gate)

| ID | Item | Status | Mitigation / continuation |
|----|------|--------|---------------------------|
| **D8-01** | D1 in-process BFS scale ceiling | ? Mitigated | Neo4j adapter + Phase 21 sync ops |
| **D8-02** | Vector seeds for composite graph leg | ? **Open** | `GRAPH_VECTOR_SEEDS_ENABLED` flag + manifest `graphVectorSeedsEnabled`; **no runtime seed leg yet** ? **Phase 21C** materialization |
| **D8-03** | Alternate engines (Neptune, Dgraph, Memgraph) | ? **Open** | `IGraphProvider` port + factory swap; only D1 + Neo4j adapters shipped |

See [COMPLETION.md](COMPLETION.md) deferred table � [RETROSPECTIVE.md](RETROSPECTIVE.md) accepted debt.

---

## 14. Actor Model

### Actor interaction with graph

Phase 8 does not introduce new actor types. Graph traversal is triggered by:

| Actor | Trigger | Result |
|-------|---------|--------|
| Human | UI "Explore related" | Traversal displayed |
| AI | `traverse_relations` tool | Memory IDs in context |
| Automation | Graph API call | Traversal results |

### Actor metadata

No changes to `ActorMetadata` in Phase 8.

---

## 15. Session Model

### Graph in session context

Phase 8 adds graph traversal to the retrieval layer:

```
+---------------------------------------------------------------------+
�                  Session Context � Graph Extended                     �
�                                                                      �
�  +---------------------------------------------------------------+  �
�  �  Memory Retrieval (SQL)                                       �  �
�  �  ? Candidate memories from keyword/search                     �  �
�  +---------------------------------------------------------------+  �
�                              �                                       �
�                              ?                                       �
�  +---------------------------------------------------------------+  �
�  �  Semantic Retrieval (Vector) � Optional Phase 6              �  �
�  �  ? Candidate memories from embedding similarity               �  �
�  +---------------------------------------------------------------+  �
�                              �                                       �
�                              ?                                       �
�  +---------------------------------------------------------------+  �
�  �  Graph Traversal (Phase 8) � NEW                            �  �
�  �  ? Neighborhood expansion from seed memories                 �  �
�  �  ? Relation-type filtering                                   �  �
�  �  ? Bounded depth traversal                                    �  �
�  +---------------------------------------------------------------+  �
�                              �                                       �
�                              ?                                       �
�  +---------------------------------------------------------------+  �
�  �  Ranker � Fusion + Deduplication                            �  �
�  +---------------------------------------------------------------+  �
+---------------------------------------------------------------------+
```

---

## 16. Memory Scope

### Graph scope enforcement

Graph traversal respects `MemoryScope`:

| Field | Graph behavior |
|-------|---------------|
| `ownerId` | **Required** � All traversal filtered by owner |
| `workspaceId` | Filter on memory hydration (Phase 9+) |
| `agentId` | Metadata only � no traverse state (Phase 9+) |

### Traversal boundary

```typescript
// All graph queries include ownerId filter
const traverseNeighbors = async (
  memoryId: string,
  scope: MemoryScope,  // Contains ownerId
  options: TraversalOptions
): Promise<string[]> => {
  // WHERE owner_id = scope.ownerId � enforced in adapter
};
```

---

## 17. Event Model (Future)

### Graph events (Phase 10+)

Phase 8 does not implement event bus. Future events:

| Event | Trigger | Data |
|-------|---------|------|
| `graph.traversed` | Successful traversal | memoryIds, depth, duration |
| `graph.expansion` | Neighborhood found | seedId, neighborCount |

---

## 18. Versioning Policy

### Graph versioning

| Aspect | Policy |
|--------|--------|
| `IGraphProvider` interface | Stable; additive methods only |
| `D1GraphAdapter` | Internal versioning |
| Traversal results | Additive fields |
| External adapters | Per-adapter versioning |

### Migration

No schema migration required for Phase 8:
- Flat `memory_relations` unchanged
- New port, no existing changes

---

## 19. Future Compatibility

> **Successor closure (2026-07-04):** Phases 6.5, 8.7, 9, 10, and 21 extended graph capabilities without rewriting `IGraphProvider` or relation CRUD.

### Phase 6.5 � Progressive retrieval (landed)

| Design element | Impact | Outcome |
|---------------|--------|---------|
| Relations stage | One-hop neighbor summaries in context | `expandWithRelationNeighbors` when `GRAPH_RETRIEVAL=true` |
| Deep BFS | MCP `traverse_relations` depth 1�3 | Intentional split � not deferred debt |

### Phase 8.7 � Relation inference (landed)

| Design element | Impact | Outcome |
|---------------|--------|---------|
| Edge population | Inferred `memory_relations` | Async jobs; manual edges immutable (ADR-041) |

### Phase 9 � Multi-AI (landed)

Phase 8 design enabled Phase 9 integration:

| Design element | Phase 9 impact | Outcome |
|---------------|----------------|---------|
| `IGraphProvider` | Workspace filter on hydration | Port unchanged |
| Traversal results | Agent-scoped memories | Owner isolation preserved |

### Phase 10 � Enterprise (landed, opt-in)

| Design element | Phase 10 impact | Outcome |
|---------------|----------------|---------|
| `IGraphProvider` | Org RBAC on API | Adapter swap unchanged |
| Graph events | Audit trail | Bus ? Phase 12 |

### Phase 21 � Search & graph production (landed)

| Design element | Impact | Outcome |
|---------------|--------|---------|
| Index sync | Meilisearch + Neo4j orchestration | `SEARCH_GRAPH_PLATFORM_ENABLED` (ADR-022) |
| Stewardship | `IndexRepairTask`, `GraphRepairTask` | Phase 04.7 pipeline |
| Vector seeds (21C) | `GRAPH_VECTOR_SEEDS_ENABLED` flag reserved | **D8-02 open** � manifest only; runtime seed leg not built |

### Open deferred (D8-02 / D8-03)

| ID | Item | Continuation |
|----|------|--------------|
| **D8-02** | Vector seeds for graph composite leg | Phase **21C** � materialize vector-derived traversal seeds when flag enabled |
| **D8-03** | Neptune / Dgraph / Memgraph adapters | New `IGraphProvider` implementations; Neptune via HTTP/Gremlin first candidate |

### Three-phase guarantee (gate-time � validated post-gate)

1. **Port pattern** � `IGraphProvider` survives Phases 8-10.
2. **Flat relations** � No graph-native storage migration.
3. **Composite integration** � Graph source plugs into existing pipeline.
4. **Adapter swap** � External engines via new adapter, not replacement.

---

## 20. Constitution Compliance

### Constitutional alignment

| Constitution rule | Phase 8 compliance |
|------------------|-------------------|
| Boundary discipline | ? Graph is retrieval adapter; no graph runtime |
| Replaceability | ? Port for graph engine |
| Owner sovereignty | ? `ownerId` filter in all traversal |
| Inward dependencies | ? Adapter implements port |
| Layer separation | ? Graph in retrieval layer only |
| Additive first | ? New source; existing sources unchanged |
| No agent logic | ? Traversal is data access, not reasoning |

### Forbidden patterns prevented

| Forbidden pattern | Phase 8 prevention |
|------------------|---------------------|
| Graph-native storage | ? Flat relations only; no graph DB in core schema |
| Graph runtime | ? Adapter-only implementation |
| GraphQL API | ? REST/MCP only |
| Graph visualization | ? External tooling only |

---

## 21. Success Criteria

### Phase 8 success criteria

| Criterion | Verification | Evidence |
|-----------|--------------|----------|
| `IGraphProvider` port defined | Interface document | Section 8 |
| D1 BFS adapter implemented | Unit tests | TESTING.md |
| Graph source in composite | Integration test | TESTING.md |
| Traversal bounded | Configurable depth cap | Section 10 |
| No relation service changes | API compatibility test | TESTING.md |
| MCP/REST graph API | Additive tools + endpoints | Section 11�12 |

### Deliverables

| Deliverable | Status |
|-------------|--------|
| `IGraphProvider` port | ? Defined |
| D1 BFS adapter | ? Implemented |
| Neo4j adapter (opt-in) | ? Post-gate |
| Graph retrieval source | ? Implemented |
| Composite integration | ? Implemented |
| Unit tests | ? TESTING.md |
| Integration tests | ? TESTING.md |

---

## 22. Risks

### Identified risks

| Risk | Likelihood | Impact | Mitigation |
|------|-------------|--------|------------|
| In-process BFS at scale | Medium | Medium | Neo4j adapter + Phase 21 sync |
| Traversal depth explosion | Low | High | Configurable cap + depth limit |
| Graph cycles (loops) | Low | Medium | Visited set in BFS |
| Memory pressure from large result sets | Medium | Medium | Strict cap enforcement |

### Mitigated risks

| Risk | Mitigation |
|------|------------|
| Large edge sets (D1) | `GRAPH_PROVIDER=neo4j` + backfill |
| Circular relations | Visited set in traversal |
| Missing relations | Flat relations remain; inference optional (8.7) |

---

## 23. References

### Governance documents

| Document | Relevance |
|----------|-----------|
| [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) | Immutable law; port patterns |
| [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) | Layer boundaries; port pattern |
| [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) | Phase 8 scope |
| [ADR-001](../../adr/001-multi-source-retrieval.md) | Composite pattern |
| [ADR-002](../../adr/002-workspace-identity-model.md) | Scope types |
| [ADR-004](../../adr/004-repository-port-types.md) | Port pattern |

### Phase documents

| Phase | Document | Phase 8 relation |
|-------|----------|-----------------|
| 6 | [06-hybrid-retrieval/DESIGN.md](../06-hybrid-retrieval/DESIGN.md) | Composite pattern |
| 6.5 | [06.5-progressive-retrieval/DESIGN.md](../06.5-progressive-retrieval/DESIGN.md) | Relations stage |
| 7 | [07-agent-runtime/DESIGN.md](../07-agent-runtime/DESIGN.md) | Protocol contracts |
| 8.7 | [08.7-graph-relation-inference/DESIGN.md](../08.7-graph-relation-inference/DESIGN.md) | Inferred edges |
| 21 | [21-search-graph-prod/DESIGN.md](../21-search-graph-prod/DESIGN.md) | Sync platform |

### External references

| Reference | Relevance |
|-----------|-----------|
| PostgreSQL WITH RECURSIVE | D1 CTE syntax |
| Graph Traversal Patterns | STP (Source-Target-Path) |
| Reciprocal Rank Fusion | Multi-source ranking |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md). Do not contradict Approved ADRs.*
