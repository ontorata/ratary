# Phase 08.6 — Learning Intelligence Engine — DESIGN

**Document:** DESIGN  
**Phase status:** Ready — draft (2026-07-04); awaiting owner approval  
**ADR gate:** [ADR-057](../../../docs/adr/057-learning-intelligence-engine.md) — Proposed  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) · extends [08.5](../08.5-observation-reflection-learning/DESIGN.md)

---

## Purpose

Continuously improve retrieval, recommendations, and context quality from signals and feedback while **knowledge content remains immutable** unless explicit stewardship/review/evolution paths apply.

## Architecture

Async pipeline: Observation (08.5) → Learning Orchestrator → component engines → policy snapshots / recommendation cache → Ranker & `IRetrievalPolicy` read active snapshot.

**Hot path:** append learning events only. **No** ML or batch mining on CRUD.

## Components (10)

1. Ranking learning — `IRankingLearningEngine`
2. Recommendation — `IRecommendationEngine`
3. Pattern mining — `IPatternMiner`
4. Knowledge discovery — `IKnowledgeDiscoveryEngine`
5. Feedback learning — `IFeedbackLearningEngine`
6. Memory quality recommendations — feeds 04.7
7. Context optimization — `IContextOptimizationEngine` / 06.5 params
8. Dataset export — `ILearningDatasetExporter`
9. Evaluation — `ILearningEvaluationEngine`
10. Continual incremental runs — orchestrator

## ML boundary

`IMLProvider` registry (sklearn, ONNX, etc.) in `learning/adapters/ml/` only. Training orchestration hook (L29); GPU training external.

## MemoryService impact

**None** — signature unchanged.

## Success criteria

- ADR-057 Approved
- Flag off = zero regression
- No SSOT content mutation by learning jobs
- Ranker uses snapshot without RankerV2

See [DELIVERY-TRACK.md](DELIVERY-TRACK.md) for L21–L30 ship order.
