# Intelligence Pipeline — Request vs Learning Paths

**Status:** Draft (2026-07-04)  
**Authority:** [08.6-learning-intelligence/DESIGN.md](../../phases/08.6-learning-intelligence/DESIGN.md)

---

## Request path (sync, bounded)

```
Developer / AI → Memory Engine → Knowledge Engine → Retrieval Engine → Context → LLM (external)
```

## Learning path (async, event-driven)

```
Developer / AI → Observation Engine (08.5)
              → Learning Engine (08.6)
              → Recommendation / Prediction
              → Dataset Generator → Fine-Tuning (external) → Ratary Model (external port)
              → Improved Retrieval (policy snapshot)
              → (loop) Continuous Learning (08.6-L30)
```

## Enrichment path (batch, deterministic)

```
Knowledge Engine → Rule Matching → Inference Engine (08.7) → Knowledge Engine (derived relations/patterns)
```

## Invariants

- Learning **does not** mutate `memories.content` on the hot path
- Fine-tuning and foundation models run **outside** memory core; scores via `IMLProvider`
- LLM reasoning remains **external** (Phase 7 boundary)

## Closed loop

New memories + signals → policy update → better retrieval/recommendations → new observations → incremental learning job.
