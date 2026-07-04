# Phase 8.5 — Quality Signals — CHECKLIST

**Phase status:** ✅ Implemented (2026-07-04) · ADR-026 Accepted  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-026](../../../docs/adr/026-memory-quality-signals.md)

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
| D85-01 | MCP `submit_signal` tool | ⏳ Open | **Phase 13.1 follow-up** — REST ingest sufficient for gate; remote MCP parity |
| D85-02 | Phase 12 `IEventBus.publish('memory.signal.received')` | ⏳ Open | Topic defined in `domain-event-topics.ts`; publisher not wired on ingest |
| D85-03 | `RANKING_ADAPTATION_ENABLED` batch weight mutation | ⏳ Open | `reflect:signals` advisory stub only — ranker weights unchanged |
| D85-04 | Ranker sort-order integration test | ⏳ Open | Importance delta path unit-tested; E2E rank order test deferred |
| D85-05 | REST E2E `POST /signals` with auth fixture | ⏳ Open | Route gated at boot — composition tests cover wiring |

### Checklist (frozen at gate)

- [ ] D85-01 — MCP `submit_signal` tool
- [ ] D85-02 — Phase 12 event publish `memory.signal.received`
- [ ] D85-03 — `RANKING_ADAPTATION_ENABLED` batch weight mutation (beyond advisory stub)
- [ ] D85-04 — Ranker sort-order integration test
- [ ] D85-05 — REST E2E signals route test

**Partial bridge (post-gate):** Phase **8.6** `LearningEventRecorder` appends to learning event store when `SIGNAL_INGEST_ENABLED=true` **and** `LEARNING_ENGINE_ENABLED=true` — not the Phase 12 bus.

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — Implemented 2026-07-04 |
| **ADR** | ADR-026 Accepted |
| **Regression** | 689 at gate → **722** platform snapshot |
