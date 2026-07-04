# Phase 8.5 — Quality Signals — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-026 Accepted](../../../docs/adr/026-memory-quality-signals.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Types | `MemoryQualitySignal`, `MemorySignalType`, ingest result | ✅ |
| Ports | `IMemorySignalIngestor`, `ISignalNormalizer` | ✅ |
| Normalizer | `DefaultSignalNormalizer` — auth + payload validation | ✅ |
| Scoring | `ImportanceScoringPolicy` — bounded pure deltas | ✅ |
| Ingestor | `MemorySignalIngestor` — idempotent, scope-safe | ✅ |
| Store | `SqlMemorySignalStore` + `memory_signals` migration | ✅ |
| REST | `POST /api/v1/signals` when `SIGNAL_INGEST_ENABLED=true` | ✅ |
| CLI | `reflect:signals` — dry-run default, advisory-only | ✅ |
| Composition | `create-signal-ingest-ports.ts` | ✅ |
| Manifest | `supportsQualitySignals` in capability builder | ✅ |
| Barrel | `src/ingest/index.ts` | ✅ |

---

## File map

```
src/ingest/
  memory-quality-signal.types.ts
  imemory-signal-ingestor.interface.ts
  isignal-normalizer.interface.ts
  default-signal-normalizer.ts
  memory-signal-ingestor.ts
  importance-scoring-policy.ts
  index.ts
src/infrastructure/signals/
  sql-memory-signal-store.ts
src/composition/
  create-signal-ingest-ports.ts
src/controllers/signals.controller.ts
src/routes/v1/signals.routes.ts
scripts/
  reflect-signals.ts
tests/ingest/
  signal-ingest.test.ts
  importance-scoring-policy.test.ts
tests/composition/
  signal-ingest-ports.test.ts
tests/db/
  extension-tracks-migration.test.ts
```

---

## Wiring

```typescript
createSignalIngestPorts(sql, env) → { enabled, normalizer, ingestor }

REST (when enabled):
  POST /api/v1/signals → SignalsController → normalizer → ingestor
  Optional: LearningEventRecorder when LEARNING_ENGINE_ENABLED (Phase 8.6)

Access path (existing):
  recordAccess / get_context → internal access signals (Phase 4 baseline)

CLI:
  npm run reflect:signals [-- --execute]
  RANKING_ADAPTATION_ENABLED=false → advisory-only, no mutation (D85-03)
```

---

## Phase 8.6 bridge (post-gate)

When both `SIGNAL_INGEST_ENABLED=true` and `LEARNING_ENGINE_ENABLED=true`:

```typescript
// rest-server.ts
createSignalsController(..., {
  eventRecorder: learningPorts.enabled ? learningPorts.eventRecorder : undefined,
})
```

Records to **learning event store** (ADR-057) — separate from Phase 12 `IEventBus` (D85-02).

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `SIGNAL_INGEST_ENABLED` | `false` | Master switch — routes + importance updates |
| `SIGNAL_STORE_PROVIDER` | `none` | `sql` \| `analytics` \| `none` |
| `RANKING_ADAPTATION_ENABLED` | `false` | Batch reflection job (stub) |

---

## Signal types

| Type | Effect |
|------|--------|
| `explicit_feedback` | Bounded importance delta via `ImportanceScoringPolicy` |
| `access` | Recorded; scoring via existing access path |
| `consolidation_hint` | Audit only (`appliedDelta: 0`); Phase 5.5 consumer |
| `ingest` | Normalized metadata for Phase 12 alignment |

---

## Non-regression

- No signal routes or importance changes when `SIGNAL_INGEST_ENABLED=false`
- Ranker unchanged when ingest disabled — importance only bumped on explicit ingest path
- All existing tests green with flags off

---

## Explicit non-goals (Constitution)

No agent reflection loops, LLM introspection, or autonomous memory mutation.

---

## Rollback

Set `SIGNAL_INGEST_ENABLED=false`; signal routes unregistered at boot. `memory_signals` table is append-only — safe to leave in schema.
