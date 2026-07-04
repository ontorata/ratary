# Phase 08.6 — Learning Intelligence Engine — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented W1 + L26 (2026-07-04) · ADR-057 Accepted  
**ADR gate:** [ADR-057](../../../docs/adr/057-learning-intelligence-engine.md) — **Accepted**  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) · extends [08.5](../08.5-observation-reflection-learning/DESIGN.md)

---

## Purpose

Continuously improve retrieval, recommendations, and context quality from signals and feedback while **knowledge content remains immutable** unless explicit stewardship/review/evolution paths apply.

## Architecture

Async pipeline: Observation (08.5) → Learning Orchestrator → component engines → policy snapshots / recommendation cache → Ranker & `IRetrievalPolicy` read active snapshot.

**Hot path:** append learning events only. **No** ML or batch mining on CRUD.

## Components (10)

| # | Component | Port | W1 status |
|---|-----------|------|-----------|
| 1 | Ranking learning | `IRankingLearningEngine` | ✅ L26 |
| 2 | Recommendation | `IRecommendationEngine` | 🔲 Stub |
| 3 | Pattern mining | `IPatternMiner` | 🔲 Stub |
| 4 | Knowledge discovery | `IKnowledgeDiscoveryEngine` | 🔲 Stub |
| 5 | Feedback learning | `IFeedbackLearningEngine` | 🔲 Stub |
| 6 | Quality recommendations | feeds 04.7 | 🔲 Deferred |
| 7 | Context optimization | `IContextOptimizationEngine` | 🔲 Stub |
| 8 | Dataset export | `ILearningDatasetExporter` | 🔲 Stub |
| 9 | Evaluation | `ILearningEvaluationEngine` | 🔲 Stub |
| 10 | Continual runs | `ILearningOrchestrator` | ✅ L21 |

Foundation (L21–L22) and adaptive ranking (L26) implemented; remaining engines registered as no-op stubs.

## ML boundary

`IMLProvider` registry (sklearn, ONNX, etc.) in `learning/adapters/ml/` only. Training orchestration hook (L29); GPU training external. **Not implemented in W1.**

## MemoryService impact

**None** — signature unchanged.

## Success criteria

- [x] ADR-057 Accepted
- [x] Flag off = zero regression
- [x] No SSOT content mutation by learning jobs
- [x] Ranker uses snapshot without RankerV2
- [ ] Full L24–L30 component implementations (deferred)

See [DELIVERY-TRACK.md](DELIVERY-TRACK.md) for L21–L30 ship order.
