# Phase 8.5 — Quality Signals — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Signal ingest pipeline: normalizer, importance policy, `MemorySignalIngestor`, SQL store, REST `/signals` when `SIGNAL_INGEST_ENABLED=true`. No agent reflection loops. Post-gate: Phase **8.6** `LearningEventRecorder` bridge when learning engine enabled.

Evidence: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md) · [CHECKLIST.md](CHECKLIST.md).

---

## What worked well

- `create-signal-ingest-ports.ts` gates routes behind flag default off
- Four signal types with bounded importance deltas
- Idempotent scope-safe ingestor; manifest `supportsQualitySignals`
- Constitution boundary preserved — ingest only, not agent learning

---

## What was harder than expected

- MCP `submit_signal` not built
- Phase 12 `memory.signal.received` publish deferred
- Ranking adaptation is advisory stub only

---

## Accepted debt

| ID | Item | Mitigation | Status |
|----|------|------------|--------|
| D85-01 | REST-only ingest when enabled | ⏳ Open | REST `POST /api/v1/signals` → Phase **13.1** MCP |
| D85-02 | No Phase 12 bus publish on ingest | ⏳ Open | **8.6** `LearningEventRecorder` + topic defined |
| D85-03 | No automated ranker batch mutation | ⏳ Open | Hot-path `bumpImportance`; `reflect:signals` dry-run |
| D85-04 | Rank order E2E test gap | ⏳ Open | Unit policy + ingest tests |
| D85-05 | REST E2E signals route | ⏳ Open | Composition ports test |
| D85-06 | `lifecycleState` GET field | ⏳ Open | Column exists; use importance/access_count |

---

## Successor closure (2026-07-04)

| Phase | Outcome |
|-------|---------|
| **8.6** | ✅ `LearningEventRecorder` — learning event store from REST ingest |
| **12** | ⏳ `memory.signal.received` on `IEventBus` (D85-02) |
| **13.1** | ⏳ MCP `submit_signal` for remote clients (D85-01) |

---

## Recommendations

1. Wire D85-02 publisher after signal ingest when `EVENT_BUS_PROVIDER` active.
2. Add D85-01 MCP tool reusing `SignalsController` handler path.
3. Keep ranker mutation behind explicit `RANKING_ADAPTATION_ENABLED` + stewardship review.

---

*Recorded at gate 2026-07-04; successor closure appended 2026-07-04.*
