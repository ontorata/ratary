# Phase 8 — Knowledge Graph — TESTING

**Document:** TESTING  
**Phase status:** Closed  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

**Evidence (2026-07-03):** **231 tests** passing.

---

## Test matrix

| Area | File | Coverage |
|------|------|----------|
| Port contract | `tests/graph/igraph-provider.interface.test.ts` | Types, capabilities |
| Pure BFS | `tests/graph/d1-graph.adapter.test.ts` | Outgoing, incoming, depth, budget, owner isolation |
| Retrieval leg | `tests/graph/graph-retrieval-candidate-source.test.ts` | Appendix F: seeds, budget, archived, dedupe |
| RRF roles | `tests/memory/composite-retrieval-candidate-source.test.ts` | 40/40/30 triple, 50/50 sql+graph order-independent |
| Composition | `tests/memory/create-context-service.test.ts` | Graph neighbor recall, fallback without db |
| Graph service | `tests/services/graph.service.test.ts` | Capabilities, NotFound, archived filter |
| REST graph | `tests/api/graph.test.ts` | Capabilities, traverse, validation |
| MCP tools | `tests/mcp/tools.test.ts` | 16 tools incl. graph |
| Cross-owner | `tests/api/cross-owner-leak.test.ts` | Graph traverse 404; capabilities; context+GRAPH isolation |

---

## Security verification

- Owner B cannot traverse Owner A seed memory (404).
- Context with `GRAPH_RETRIEVAL=true` does not leak Owner A graph neighbors to Owner B.
- Traversal and hydration scoped by `ownerId` on every path.

---

*Read-only at phase gate PASS.*
