# Learning Track L21–L30

**Status:** Draft (2026-07-04)  
**Umbrella:** [08.6-learning-intelligence/DESIGN.md](../08.6-learning-intelligence/DESIGN.md)  
**Namespace:** `08.6-L21` … `08.6-L30` (canonical) · Learning Phase 21–30 (narrative)

| L# | Name | Port / deliverable |
|----|------|-------------------|
| L21 | Learning Foundation | `ILearningOrchestrator`, event store, artifact store |
| L22 | Behavior Analytics | `IBehaviorAnalyticsEngine` |
| L23 | Pattern Mining | `IPatternMiner` |
| L24 | Recommendation Engine | `IRecommendationEngine` |
| L25 | Knowledge Discovery | `IKnowledgeDiscoveryEngine` |
| L26 | Adaptive Ranking | `IRankingLearningEngine` → Ranker snapshot |
| L27 | Feedback Learning | `IFeedbackLearningEngine` |
| L28 | Dataset Generator | `ILearningDatasetExporter` |
| L29 | Model Training Pipeline | `IMLProvider` hook — compute **external** |
| L30 | Learning Platform capstone | `ILearningEvaluationEngine`, closed loop |

**Ship order:** L21 → L22 → L23–L25 → L24,L26,L27 → L28–L29 → L30.

**Flag:** `LEARNING_ENGINE_ENABLED=false` (default).

**ADR:** ADR-057 (umbrella), ADR-058 (ML provider boundary).
