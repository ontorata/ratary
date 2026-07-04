# Phase 8 — Knowledge Graph — TESTING

**Document:** TESTING  
**Phase status:** Closed  
**Gate:** PASS 2026-07-03  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Gate (2026-07-03) | Platform snapshot (2026-07-04) |
|--------|-------------------|--------------------------------|
| Total tests | **231** green | **722 passed** \| 3 skipped |
| Phase 8 new tests | Graph suite at gate | + neo4j, 8.7, 6.5, 21, stewardship |

---

## Test matrix

| Area | File | Coverage |
|------|------|----------|
| Port contract | `tests/graph/igraph-provider.interface.test.ts` | Types, capabilities |
| Pure BFS / D1 | `tests/graph/d1-graph.adapter.test.ts` | Outgoing, incoming, depth, budget, owner isolation |
| Neo4j adapter | `tests/infrastructure/neo4j-graph-store.adapter.test.ts` | Opt-in external store |
| Neo4j backfill | `tests/scripts/neo4j-backfill.test.ts` | Backfill CLI |
| Retrieval leg | `tests/graph/graph-retrieval-candidate-source.test.ts` | Appendix F: seeds, budget, archived, dedupe |
| RRF roles | `tests/memory/composite-retrieval-candidate-source.test.ts` | 40/40/30 triple, 50/50 sql+graph order-independent |
| Composition | `tests/memory/create-context-service.test.ts` | Graph neighbor recall, fallback without db |
| Relations stage | `tests/memory/relation-context-expander.test.ts` | Phase 6.5 one-hop expansion |
| Graph service | `tests/services/graph.service.test.ts` | Capabilities, NotFound, archived filter |
| REST graph | `tests/api/graph.test.ts` | Capabilities, traverse, validation |
| MCP tools | `tests/mcp/tools.test.ts` | **22 tools** SSOT incl. graph tools |
| Cross-owner | `tests/api/cross-owner-leak.test.ts` | Graph traverse 404; capabilities; context+GRAPH isolation |
| Stewardship | `tests/memory/stewardship/graph-repair.task.test.ts` | Phase 04.7 graph repair task |

---

## Security verification

- Owner B cannot traverse Owner A seed memory (404).
- Context with `GRAPH_RETRIEVAL=true` does not leak Owner A graph neighbors to Owner B.
- Traversal and hydration scoped by `ownerId` on every path.
- Neo4j adapter enforces same owner-scoped edge load contract as D1.

---

## Post-gate note

Successor phase tests (8.7 inference, 21 search-graph sync) extend graph edge/index coverage without changing Phase 8 port contracts.

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
