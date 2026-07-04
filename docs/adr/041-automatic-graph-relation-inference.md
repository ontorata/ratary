# ADR-041: Automatic Graph Relation Inference (Phase 08.7)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 8 traverses relations; Phase 2.6 supports manual relations with `source_type=inferred` unused. Phase 08.7 adds async inference from observation, semantic similarity, project, conversation, temporal proximity, dependency.

Design: [.ai/phases/08.7-graph-relation-inference/DESIGN.md](../../.ai/phases/08.7-graph-relation-inference/DESIGN.md)

## Decision

Adopt `IRelationInferenceOrchestrator` + source ports; upsert inferred edges; manual relations never overwritten. `RELATION_INFERENCE_ENABLED=false` default.

## Rollback

Disable flag; no inference jobs scheduled.
