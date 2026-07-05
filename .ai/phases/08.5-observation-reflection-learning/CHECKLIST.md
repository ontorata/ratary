# Phase 8.5 — Quality Signals — CHECKLIST

**Phase status:** ✅ Implemented (2026-07-04) · ADR-026 Accepted  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-026](../../adr/026-memory-quality-signals.md)

---

## Implementation tracks

- [x] **8.5A** — `MemoryQualitySignal` types + port interfaces
- [x] **8.5B** — `DefaultSignalNormalizer` + `ImportanceScoringPolicy`
- [x] **8.5C** — `MemorySignalIngestor` (idempotent, scope-safe)
- [x] **8.5D** — `memory_signals` SQL store + migration
- [x] **8.5E** — `POST /api/v1/signals` (gated `SIGNAL_INGEST_ENABLED`)
- [x] **8.5F** — `reflect:signals` CLI (advisory-only batch)
- [x] **8.5G** — Composition root + barrel + manifest flag
- [x] **8.5H** — Contract tests + docs

---

## Testing

- [x] Importance scoring policy unit tests
- [x] Signal ingest unit tests (idempotency, scope, consolidation_hint)
- [x] Composition ports test
- [x] Migration test for `memory_signals`
- [x] Manifest builder flag test

---

## Documentation

- [x] DESIGN.md — Implemented, success criteria checked
- [x] IMPLEMENTATION.md, README.md, TESTING.md, CHECKLIST.md
- [x] ADR-026 — Accepted with implementation section
- [x] `04-ARCHITECTURE.md` — Quality signals section
- [x] `phases/README.md` — index entry

---

## Constitution boundary

- [x] No agent reflection loops in repository
- [x] No LLM introspection or autonomous memory mutation
- [x] Signals are inputs — cannot bypass auth or delete memories

---

## Deferred

| ID | Item | Status | Owner / notes |
|----|------|--------|---------------|
| D85-01 | MCP `submit_signal` tool | ✅ Closed | MCP `submit_signal` + shared `processSignalIngest` handler path |
| D85-02 | Phase 12 `IEventBus.publish('memory.signal.received')` | ✅ Closed | `DomainEventPublisher.publishMemorySignalReceived` on ingest |
| D85-03 | `RANKING_ADAPTATION_ENABLED` batch weight mutation | ✅ Closed | `SignalReflectionRunner` + `reflect:signals --execute` |
| D85-04 | Ranker sort-order integration test | ✅ Closed | `ranker.test.ts` — importance delta reorder (D85-04) |
| D85-05 | REST E2E `POST /signals` with auth fixture | ✅ Closed | `tests/api/signals.test.ts` |
| D85-06 | `lifecycleState` on GET memory | ✅ Closed | Column + `GET /memory/:id` optional field when set |

### Checklist (frozen at gate)

- [x] D85-01 — MCP `submit_signal` tool
- [x] D85-02 — Phase 12 event publish `memory.signal.received`
- [x] D85-03 — `RANKING_ADAPTATION_ENABLED` batch weight mutation (beyond advisory stub)
- [x] D85-04 — Ranker sort-order integration test
- [x] D85-05 — REST E2E signals route test
- [x] D85-06 — Expose `lifecycleState` on GET memory (optional metadata)

**Partial bridge (post-gate):** Phase **8.6** `LearningEventRecorder` appends to learning event store when `SIGNAL_INGEST_ENABLED=true` **and** `LEARNING_ENGINE_ENABLED=true` — mitigates analytics need until **D85-02** bus publish lands.

**Regression:** 689 at gate → **749** platform snapshot (2026-07-05)

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — Implemented 2026-07-04 |
| **ADR** | ADR-026 Accepted |
| **Deferred** | D85-01–06 open — mitigated per DESIGN § Compatibility |
