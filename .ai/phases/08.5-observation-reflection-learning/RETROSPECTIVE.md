# Phase 8.5 — Quality Signals — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Signal ingest pipeline: normalizer, importance policy, `MemorySignalIngestor`, SQL store, REST `/signals` when `SIGNAL_INGEST_ENABLED=true`. No agent reflection loops.

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

- REST-only ingest when enabled
- No automated ranker mutation

---

## Recommendations

- Publish `memory.signal.received` on Phase 12 bus for Phase 8.6 feed
- Add MCP `submit_signal` for remote MCP clients

---

*Recorded at gate 2026-07-04. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
