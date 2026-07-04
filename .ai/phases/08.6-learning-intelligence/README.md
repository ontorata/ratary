# Phase 08.6 — Learning Intelligence Engine

**Status:** Design draft — awaiting ADR-057 approval  
**ADR:** [ADR-057](../../../docs/adr/057-learning-intelligence-engine.md) (Proposed)

## Scope

Self-improving **policy layer**: ranking, recommendations, patterns, evaluation, dataset export — **without** mutating memory SSOT on the hot path.

Extends Phase 08.5 (observation). Delivery decomposed in [DELIVERY-TRACK.md](DELIVERY-TRACK.md) and [roadmap L21–L30](../roadmap/15-LEARNING-TRACK-L21-L30.md).

## Non-goals

- Agent planner / autonomous loops
- In-repo foundation model training
- LLM reasoning in learning pipeline
- `RankerV2` / `MemoryService` rewrite

## Key ports

`ILearningOrchestrator`, `ILearningEventStore`, `ILearningArtifactStore`, `IRankingLearningEngine`, `IRecommendationEngine`, `IPatternMiner`, `IKnowledgeDiscoveryEngine`, `IFeedbackLearningEngine`, `ILearningDatasetExporter`, `IMLProvider`, `ILearningEvaluationEngine`

## Flag

`LEARNING_ENGINE_ENABLED=false`
