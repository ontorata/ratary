# ADR-041: Automatic Graph Relation Inference (Phase 08.7)

**Status:** Implemented  
**Date:** 2026-07-04  
**Approved:** 2026-07-04 (owner — DESIGN + implementation)  
**Implemented:** 2026-07-04 — orchestrator, 3 sources, upsertInferred, CLI  
**Deciders:** Project owner  

---

## Context

Phase 8 traverses relations; Phase 2.6 supports manual relations with `source_type=inferred` unused. Phase 08.7 adds async inference from observation, semantic similarity, project, conversation, temporal proximity, dependency.

Design: [.ai/phases/08.7-graph-relation-inference/DESIGN.md](../../.ai/phases/08.7-graph-relation-inference/DESIGN.md)

## Decision

Adopt `IRelationInferenceOrchestrator` + source ports; upsert inferred edges; manual relations never overwritten. `RELATION_INFERENCE_ENABLED=false` default.

## Rollback

Disable flag; no inference jobs scheduled.

## Implementation (2026-07-04)

- `src/inference/` — orchestrator, scoring policy, 3 deterministic sources
- `MemoryRelationRepository.upsertInferred` — manual-safe upsert
- `relation_inference_evidence` audit table
- `npm run infer:relations` CLI
- Manifest `supportsRelationInference`

## References

- Phase 8 graph traversal
- ADR-006 IGraphProvider
