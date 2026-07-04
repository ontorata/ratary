# Phase 8.6 — Learning Intelligence Engine — IMPLEMENTATION

**Status:** Implemented (2026-07-04) — W1 + L26 foundation  
**ADR:** [ADR-057 Accepted](../../../docs/adr/057-learning-intelligence-engine.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| L21 | `ILearningOrchestrator`, event store, artifact store | ✅ |
| L22 | `DefaultBehaviorAnalyticsEngine` | ✅ |
| L26 | `DefaultRankingLearningEngine` + Ranker snapshot hook | ✅ |
| Hot path | `LearningEventRecorder` on signal ingest | ✅ |
| Context | `rankingSnapshotLoader` in `ContextService` | ✅ |
| CLI | `learning:run` (dry-run default) | ✅ |
| Composition | `create-learning-ports.ts` | ✅ |
| Manifest | `supportsLearningEngine` | ✅ |
| L23–L25, L24, L27–L30 | No-op engine stubs registered | 🔲 Stub |

---

## File map

```
src/learning/
  learning.types.ts
  learning.constants.ts
  ranking-policy-snapshot.ts
  learning-orchestrator.ts
  learning-event-recorder.ts
  default-behavior-analytics-engine.ts
  default-ranking-learning-engine.ts
  noop-learning-engines.ts
  noop-learning-orchestrator.ts
  index.ts
src/infrastructure/learning/
  sql-learning-event-store.ts
  sql-learning-artifact-store.ts
src/composition/create-learning-ports.ts
src/memory/ranker.ts                    # optional snapshot multipliers
src/memory/create-context-service.ts    # snapshot loader wiring
scripts/run-learning.ts
tests/learning/
tests/composition/learning-ports.test.ts
```

---

## Wiring

```typescript
createLearningPorts(sql, env) → {
  enabled, orchestrator, eventStore, artifactStore, eventRecorder
}

Signal hot path (when both 8.5 + 8.6 enabled):
  POST /api/v1/signals → ingest → LearningEventRecorder.append

Context path:
  buildContext → getActiveRankingSnapshot(scope) → Ranker.rank(..., snapshot)

Batch path:
  npm run learning:run → LearningOrchestrator.run → saveRankingSnapshot
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `LEARNING_ENGINE_ENABLED` | `false` | Master switch |
| `LEARNING_STORE_PROVIDER` | `none` | `sql` \| `none` |

Requires `SIGNAL_INGEST_ENABLED=true` for REST signal → learning event feed.

---

## Non-regression

- `MemoryService` signatures unchanged
- Ranker uses static weights when `LEARNING_ENGINE_ENABLED=false`
- No memory content mutation by learning jobs
- Stub engines return empty — no side effects

---

## Rollback

Set `LEARNING_ENGINE_ENABLED=false`; Ranker reverts to static `ranking.config.ts` weights.
