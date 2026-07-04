# Phase 8.6 — Learning Intelligence Engine — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/learning/behavior-analytics-engine.test.ts` | Event summarization, feedback counts |
| `tests/learning/ranking-learning-engine.test.ts` | Min threshold, bounded multipliers |
| `tests/learning/learning-orchestrator.test.ts` | Dry-run vs execute, snapshot persist |
| `tests/composition/learning-ports.test.ts` | Composition root env gating |
| `tests/db/extension-tracks-migration.test.ts` | `learning_events`, `learning_policy_snapshots` |
| `tests/memory/ranker.test.ts` | Snapshot access boost |
| `tests/capabilities/manifest-builder.test.ts` | `supportsLearningEngine` flag |

---

## Scenarios verified

- [x] Behavior analytics counts helpful / not_helpful feedback
- [x] Ranking engine requires ≥3 feedback events before snapshot
- [x] Access multiplier bounded 0.8–1.2
- [x] Orchestrator dry-run does not persist or mark processed
- [x] Orchestrator execute saves snapshot and marks events
- [x] `LEARNING_ENGINE_ENABLED=false` → ports disabled
- [x] Migration creates learning tables + indexes
- [x] Ranker applies snapshot multipliers when provided
- [x] No agent planner / LLM code in `src/learning/`

---

## Manual verification

```bash
LEARNING_ENGINE_ENABLED=true LEARNING_STORE_PROVIDER=sql npm run learning:run
LEARNING_ENGINE_ENABLED=true LEARNING_STORE_PROVIDER=sql npm run learning:run:execute
curl http://localhost:3000/api/v1/capabilities  # supportsLearningEngine: true
```

---

## Deferred tests

- [ ] End-to-end: signal ingest → event → orchestrator → context rank order change
- [ ] REST recommendation endpoint (L24)
- [ ] Dataset export CLI (L28)
