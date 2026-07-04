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
| In-process BFS at scale | Medium | Medium | Documented MVP limit; Neo4j path Phase 10+ | Accepted |

---

*Gate PASS 2026-07-03.*
