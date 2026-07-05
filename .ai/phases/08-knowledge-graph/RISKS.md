# Phase 8 — Knowledge Graph — RISKS

**Phase status:** Closed (gate PASS 2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Graph traversal scope leak | Medium | Critical | Owner-scoped edge load + cross-owner tests | Mitigated |
| Relation API rewrite | Low | High | Read-only port; CRUD unchanged | Not realized |
| RRF cap imbalance (3 sources) | Medium | Medium | Role-based caps in ranking config | Mitigated |
| In-process BFS at scale | Medium | Medium | D1 default; Neo4j adapter + Phase 21 sync | Mitigated |
| Vector graph seeds incomplete | Low | Low | `GRAPH_VECTOR_SEEDS_ENABLED` flag; **D8-02 open** → Phase 21C | Accepted |
| Alternate graph engines not built | Low | Low | **D8-03 open** — `IGraphProvider` + Neo4j mitigates scale | Accepted |
| Inferred relation noise (8.7) | Medium | Medium | Manual relations immutable; inference opt-in | Transferred — Phase 8.7 |

---

*Gate PASS 2026-07-03. Post-gate mitigations appended 2026-07-04.*
