# Phase 8.7 — Graph Relation Inference — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented (2026-07-04) · ADR-041 Accepted  
**ADR gate:** [ADR-041](../../../docs/adr/041-automatic-graph-relation-inference.md) — **Accepted**  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) · feeds Phase 8 `IGraphProvider`

---

## Purpose

Infer graph edges without manual CRUD. Async job-driven; `source_type=inferred`; **manual relations never overwritten**.

## Architecture

```
Batch CLI (infer:relations)
        ↓
IRelationInferenceOrchestrator
        ↓
IRelationInferenceSource[] → IRelationScoringPolicy → merge/filter
        ↓
IMemoryRelationRepository.upsertInferred (skip manual)
        ↓
IRelationEvidenceStore (optional audit)
        ↓
IGraphProvider traverses memory_relations (existing Phase 8)
```

**Hot path:** no inference on CRUD. Batch job only.

## Ports

| Port | Implementation | Status |
|------|----------------|--------|
| `IRelationInferenceOrchestrator` | `RelationInferenceOrchestrator` | ✅ |
| `IRelationInferenceSource` | project, shared_tag, temporal | ✅ |
| `IRelationScoringPolicy` | `DefaultRelationScoringPolicy` | ✅ |
| `IRelationEvidenceStore` | `SqlRelationEvidenceStore` | ✅ |

## Boundaries

- Inference runs batch-only via CLI — never on CRUD hot path
- `upsertInferred` updates `source_type=inferred` edges only — manual edges immutable
- Phase 8 `IGraphProvider` reads `memory_relations` — no parallel edge store
- Scoring policy filters confidence below 0.3 — no LLM extraction in repository

## Invariants

- Manual `source_type` edges are **never** updated or deleted by inference
- Inferred edges may be updated on re-run (weight/confidence refresh)
- Confidence below 0.3 filtered by scoring policy
- No LLM relation extraction in repository

## Non-goals

- LLM relation extraction
- Graph-native DB migration
- Real-time inference on write path

## Success criteria

- [x] ADR-041 Accepted
- [x] `upsertInferred` skips manual relations
- [x] Three deterministic inference sources
- [x] Evidence audit store (optional SQL)
- [x] Flag off = zero regression
- [ ] Semantic similarity source (deferred)
- [x] Stewardship `graph-repair` task registration (Phase 04.7) — `GraphRepairTask`
