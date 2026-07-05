# Phase 08.6 — Learning Intelligence Engine — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented W1 + L26 (2026-07-04) · ADR-057 Accepted  
**Platform snapshot:** 2026-07-04 — 722 tests; Phase 04.7 `RankingRefreshTask` bridge  
**ADR gate:** [ADR-057](../../adr/057-learning-intelligence-engine.md) — **Accepted**  
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) · extends [08.5](../08.5-observation-reflection-learning/DESIGN.md)

---

## Purpose

Continuously improve retrieval, recommendations, and context quality from signals and feedback while **knowledge content remains immutable** unless explicit stewardship/review/evolution paths apply.

## Architecture

Async pipeline: Observation (08.5) → Learning Orchestrator → component engines → policy snapshots / recommendation cache → Ranker & `IRetrievalPolicy` read active snapshot.

**Hot path:** append learning events only. **No** ML or batch mining on CRUD.

```
Phase 8.5 signals ──► LearningEventRecorder ──► learning_events (SQL)
                              │
                              ▼
                    LearningOrchestrator (batch / 04.7 stewardship)
                              │
                              ▼
              ranking_policy_snapshots ──► Ranker (ContextService)
```

## Components (10)

| # | Component | Port | Status |
|---|-----------|------|--------|
| 1 | Ranking learning | `IRankingLearningEngine` | ✅ L26 |
| 2 | Recommendation | `IRecommendationEngine` | 🔲 Stub — D86-01 |
| 3 | Pattern mining | `IPatternMiner` | 🔲 Stub — D86-02 → **Phase 08.8** [IInspectionPatternMiner](../08.8-inspection-pattern-ledger/DESIGN.md) |
| 4 | Knowledge discovery | `IKnowledgeDiscoveryEngine` | 🔲 Stub — D86-02 |
| 5 | Feedback learning | `IFeedbackLearningEngine` | 🔲 Stub — D86-03 → **Phase 08.8** confidence hook |
| 6 | Quality recommendations | feeds 04.7 | 🔲 Deferred — stewardship hooks partial |
| 7 | Context optimization | `IContextOptimizationEngine` | 🔲 Stub — D86-03 |
| 8 | Dataset export | `ILearningDatasetExporter` | 🔲 Stub — D86-03 |
| 9 | Evaluation | `ILearningEvaluationEngine` | 🔲 Stub — D86-03 |
| 10 | Continual runs | `ILearningOrchestrator` | ✅ L21 |
| — | Behavior analytics | `IBehaviorAnalyticsEngine` | ✅ L22 |

Foundation (L21–L22) and adaptive ranking (L26) implemented; remaining engines registered as no-op stubs.

## ML boundary

`IMLProvider` registry (sklearn, ONNX, etc.) in `learning/adapters/ml/` only. Training orchestration hook (L29); GPU training external. **Not implemented in W1** (D86-03).

## MemoryService impact

**None** — signature unchanged.

## Non-goals

- ML training or batch mining on CRUD hot path
- Auto-mutation of memory content without stewardship / evolution gates
- Full L24–L30 engine implementations in W1 (stubs registered only)
- RankerV2 rewrite — snapshot hook only via L26
- Agent reflection / LLM reasoning in learning pipeline

## Success criteria

- [x] ADR-057 Accepted
- [x] Flag off = zero regression
- [x] No SSOT content mutation by learning jobs
- [x] Ranker uses snapshot without RankerV2
- [x] Phase 8.5 event feed when both flags ON
- [x] Phase 04.7 `RankingRefreshTask` batch hook
- [ ] D86-01–03 — Full L24–L30 component implementations

## Deferred (CHECKLIST)

| ID | Track | Notes |
|----|-------|-------|
| D86-01 | L24 | Recommendation engine |
| D86-02 | L23, L25 | Pattern + discovery — **L23 inspection slice → Phase 08.8** |
| D86-03 | L27–L30 | Feedback, context opt, dataset, ML, eval — **L27 inspection slice → Phase 08.8** |
| D86-04 | E2E test | Signal → snapshot → rank order |
| D86-05 | Scheduler | Partial via 04.7 stewardship |

## Future Phase

| Phase | Interaction |
|-------|-------------|
| **8.5** ✅ | Signal ingest → `LearningEventRecorder` |
| **04.7** ✅ | `RankingRefreshTask` at `ranking-refresh` |
| **6.5** ✅ | Ranker snapshot in context pipeline |
| **12** ⏳ | Optional bus fan-out (via 8.5 D85-02) |
| **08.8** 🔲 | Inspection Pattern Ledger — L23/L27 specialization ([DESIGN](../08.8-inspection-pattern-ledger/DESIGN.md)) |

See [DELIVERY-TRACK.md](DELIVERY-TRACK.md) for L21–L30 ship order · [15-LEARNING-TRACK-L21-L30.md](../roadmap/15-LEARNING-TRACK-L21-L30.md).

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). **Learning** = deterministic policy adaptation from signals — not agent cognition.*
