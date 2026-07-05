# Phase 8.5 — Quality Signals — COMPLETION

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**ADR:** ADR-026  
**Master flag:** `SIGNAL_INGEST_ENABLED=false` (default OFF — zero behavior change without opt-in)

---

## Purpose

Map roadmap success criteria to durable evidence.

---

## Evidence index

| Artifact | Link |
|----------|------|
| Design | [DESIGN.md](DESIGN.md) |
| Implementation | [IMPLEMENTATION.md](IMPLEMENTATION.md) |
| Verification | [TESTING.md](TESTING.md) |
| Gate checklist | [CHECKLIST.md](CHECKLIST.md) |
| Review verdict | [REVIEW.md](REVIEW.md) |
| Migration | [MIGRATION.md](MIGRATION.md) |

---

## Success criteria

| ID | Criterion | Evidence |
|----|-----------|----------|
| SC-85-01 | MemorySignalIngestor + four signal types | ✅ Bounded importance deltas |
| SC-85-02 | memory_signals migration | ✅ migrateExtensionTracksPhase1 portion |
| SC-85-03 | Constitution — ingest only | ✅ No agent reflection loops |
| SC-85-04 | REST /signals gated | ✅ Default OFF |
| SC-85-05 | Regression suite | ✅ 689 at gate → **736** platform snapshot (2026-07-05) |
| SC-85-06 | 8.6 learning bridge | ✅ `LearningEventRecorder` when both flags ON |

**Result:** 6/6 PASS. Phase gate closed 2026-07-04.

## Metrics at gate

| Metric | Gate (2026-07-04) | Platform snapshot |
|--------|-------------------|-------------------|
| Tests | 689 passed \| 3 skipped | **736 passed** \| 3 skipped |
| Master flag | `SIGNAL_INGEST_ENABLED=false` | unchanged default |

---

## Deferred / accepted debt (mitigated)

| ID | Item | Status | Mitigation |
|----|------|--------|------------|
| D85-01 | MCP `submit_signal` | ⏳ Open | REST `POST /api/v1/signals` → Phase **13.1** |
| D85-02 | Phase 12 bus publish on ingest | ⏳ Open | **8.6** learning store; topic defined |
| D85-03 | Batch ranker weight mutation | ⏳ Open | Hot-path `bumpImportance`; `reflect:signals` dry-run |
| D85-04 | Ranker sort-order E2E test | ⏳ Open | Unit policy + ingest tests |
| D85-05 | REST E2E signals route | ⏳ Open | Composition ports test |
| D85-06 | `lifecycleState` on GET memory | ⏳ Open | Column migrated; use importance/access_count |

---

## Successor closure (post-gate)

| Phase | Item | Outcome |
|-------|------|---------|
| **8.6** | Learning event feed from signals | ✅ `LearningEventRecorder` on REST ingest when both flags ON |
| **12** | Event bus fan-out | ⏳ D85-02 — topic defined, publisher deferred |
| **13.1** | MCP signal submit | ⏳ D85-01 — REST mitigates |

---

## Rollback

Set `SIGNAL_INGEST_ENABLED=false`. See [MIGRATION.md](MIGRATION.md) and [IMPLEMENTATION.md](IMPLEMENTATION.md).

---

*Gate closed 2026-07-04. Deferred D85-xx mitigated in DESIGN § Compatibility. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
