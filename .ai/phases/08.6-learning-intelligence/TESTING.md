# Phase 8.6 — Learning Intelligence Engine — TESTING

**Document:** TESTING  
**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Gate (2026-07-04) | Platform snapshot |
|--------|-------------------|-------------------|
| Total tests | 689 passed \| 3 skipped | **722 passed** \| 3 skipped |
| Phase 8.6 new tests | learning + composition + ranker | + stewardship ranking-refresh |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/learning/behavior-analytics-engine.test.ts` | Event summarization, feedback counts |
| `tests/learning/ranking-learning-engine.test.ts` | Min threshold (≥3), bounded multipliers 0.8–1.2 |
| `tests/learning/learning-orchestrator.test.ts` | Dry-run vs execute, snapshot persist |
| `tests/composition/learning-ports.test.ts` | Composition root env gating |
| `tests/db/extension-tracks-migration.test.ts` | `learning_events`, `learning_policy_snapshots` |
| `tests/memory/ranker.test.ts` | Snapshot access boost |
| `tests/memory/stewardship/ranking-refresh.task.test.ts` | Phase 04.7 orchestrator delegation |
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
- [x] `RankingRefreshTask` delegates to orchestrator (dry-run safe)
- [x] No agent planner / LLM code in `src/learning/`

---

## Manual verification

```bash
SIGNAL_INGEST_ENABLED=true SIGNAL_STORE_PROVIDER=sql \
LEARNING_ENGINE_ENABLED=true LEARNING_STORE_PROVIDER=sql npm run learning:run

LEARNING_ENGINE_ENABLED=true LEARNING_STORE_PROVIDER=sql npm run learning:run:execute

curl http://localhost:3000/api/v1/capabilities  # supportsLearningEngine: true
```

---

## Deferred tests (CHECKLIST D86-04)

| ID | Test | Status |
|----|------|--------|
| D86-04 | End-to-end: REST signal → event → orchestrator → context rank order | Open |
| — | REST recommendation endpoint (L24) | Open — D86-01 |
| — | Dataset export CLI (L28) | Open — D86-03 |

---

## Post-gate note

Phase **8.5** signal ingest tests cover `LearningEventRecorder` wiring; Phase **04.7** covers stewardship batch path. Full cross-phase E2E remains D86-04.

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
