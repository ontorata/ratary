# Phase 6 — Hybrid Retrieval — IMPLEMENTATION

**Document:** IMPLEMENTATION  
**Phase status:** Closed  
**Gate:** PASS 2026-07-03  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record planned build sequence, modules, and composition wiring for Phase 6.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Implementation planning starts (TASK_PROMPT active) |
| **Updated by** | Implementing AI assistant; maintainer on handoff |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | Tracks milestone checkboxes in roadmap Phase 6 section |

---

## Implementation plan (draft)

**Prerequisite:** ADR-001 Approved; `TASK_PROMPT.md` rotated to Phase 6.

### Planned commit sequence

| # | Deliverable |
|---|-------------|
| 1 | Governance: ADR-001 Approved, TASK_PROMPT rotation |
| 2 | `CompositeRetrievalCandidateSource` + unit tests |
| 3 | `VectorRetrievalCandidateSource` + unit tests |
| 4 | Factory + `HYBRID_RETRIEVAL` env flag |
| 5 | Composition root wiring (`server.ts`, `mcp/server.ts`) |
| 6 | Integration tests |
| 7 | Optional fusion weights in `RankingEngine` |
| 8 | Documentation updates |

### Extension points (existing)

- `src/memory/retrieval-candidate-source.interface.ts`
- `src/memory/sql-retrieval-candidate-source.ts`
- `src/memory/retriever.ts`, `src/memory/context.service.ts`
- `src/embedding/embedding.store.interface.ts` (`searchSimilar`)
- `src/services/create-memory-service.ts`

### Wiring invariant

Single `IRetrievalCandidateSource` injected into `Retriever` at composition root — composite or SQL-only based on env.

---

*Activate when ADR-001 is Approved.*
