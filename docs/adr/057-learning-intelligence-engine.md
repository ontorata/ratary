# ADR-057: Learning Intelligence Engine (Phase 08.6)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 08.5 defines bounded signal ingest and ranking adaptation. Stakeholders require a **Learning Intelligence Platform** — recommendations, pattern mining, evaluation, dataset export — without violating Constitution (no agent loops, no SSOT mutation on hot path).

Design: [.ai/phases/08.6-learning-intelligence/DESIGN.md](../../.ai/phases/08.6-learning-intelligence/DESIGN.md)

## Problem

- Ranking weights static; no team-level learning from usage
- No recommendation or pattern layer for multi-AI collaboration
- Risk of conflating "learning" with agent reasoning or memory overwrite

## Constraints

- Extends 08.5; does not replace Ranker with RankerV2
- MemoryService signatures unchanged
- Async jobs only on learning path
- Knowledge content immutable unless 04.7/25/09.7 paths
- ML frameworks only in `learning/adapters/ml/` via `IMLProvider`

## Decision

Adopt **Learning Intelligence Engine (Phase 08.6)** with orchestrator + component ports, policy snapshot store, incremental delivery track L21–L30. Default `LEARNING_ENGINE_ENABLED=false`.

## Rollback

Disable flag; Ranker reads static `ranking.config.ts`; learning tables dormant.

## References

- ADR-026 (08.5 signals)
- [03-INTELLIGENCE-PIPELINE.md](../../.ai/core/vision/03-INTELLIGENCE-PIPELINE.md)
