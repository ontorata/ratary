# Phase 6 — Hybrid Retrieval — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-03  
  
**ADR:** [ADR-001 Implemented](../../../docs/adr/001-multi-source-retrieval.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Composite source | `CompositeRetrievalCandidateSource` — SQL + vector fusion | ✅ |
| Vector leg | `VectorRetrievalCandidateSource` — embedding similarity candidates | ✅ |
| SQL leg | Existing `SqlRetrievalCandidateSource` unchanged | ✅ |
| Fusion weights | `src/search/ranking.config.ts` — configurable RRF weights | ✅ |
| Env flag | `HYBRID_RETRIEVAL=false` default — SQL-only when OFF | ✅ |
| Composition | `create-context-service.ts` wires composite or SQL-only | ✅ |
| Owner isolation | 20 cross-owner-leak regression tests | ✅ |

---

## File map

```
src/memory/
  composite-retrieval-candidate-source.ts
  vector-retrieval-candidate-source.ts
  sql-retrieval-candidate-source.ts
  retrieval-candidate-source.interface.ts
  create-context-service.ts              HYBRID_RETRIEVAL wiring
  retriever.ts                           single IRetrievalCandidateSource inject
src/search/ranking.config.ts             fusion weights
src/config/env.ts                        HYBRID_RETRIEVAL flag
tests/memory/composite-retrieval*.test.ts
tests/security/cross-owner-leak.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `HYBRID_RETRIEVAL` | false | Enable SQL + vector composite retrieval |
| `EMBEDDING_PROVIDER` | noop | Vector leg requires non-noop embed store |

---

## Invariants

- Single `IRetrievalCandidateSource` injected into `Retriever` at composition root
- `Retriever`, `ContextService`, `MemoryRepository` unchanged
- Default env = pre-Phase-6 SQL-only behavior

---

## Rollback

`HYBRID_RETRIEVAL=false` — instant; no DDL to reverse


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
