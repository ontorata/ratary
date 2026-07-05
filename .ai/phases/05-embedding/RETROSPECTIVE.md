# Phase 5 — Embedding — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-01)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Delivered async `EmbeddingJobRunner`, `D1EmbeddingStore` (vector SQL isolated from `MemoryRepository`), idempotent backfill with `content_hash` skip. ADR-003/004 Implemented. 152 tests at gate.

Evidence: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md) · [CHECKLIST.md](CHECKLIST.md).

---

## What worked well

- No sync embed on CRUD — async job runner keeps write path fast
- Vector SQL in `D1EmbeddingStore` — ADR-003 boundary enforced
- Idempotent backfill with content_hash skip — safe re-runs
- REST/MCP contracts unchanged — zero client breakage

---

## What was harder than expected

- Provider abstraction for multiple embed models deferred
- Large corpus backfill timing not benchmarked at gate

---

## Accepted debt (at gate)

- Single embed provider path — no model routing yet
- D1 vector store — Postgres/pgvector deferred to Phase 10+ (successor path)

---

## Successor closure (2026-07-04)

| Deferred item | Closed by |
|---------------|-----------|
| pgvector / vector scale (O-05-3) | Phase 10 — ADR-011 `PgVectorStoreAdapter`, `VECTOR_PROVIDER=pgvector` |
| Hybrid retrieval / ranking | Phase 6 — ADR-001 gate PASS |
| R2 content offload (`object_key`) | Phase 10 ADR-005 + Phase 22 ADR-021 `IContentOffloadSyncer` |

---

## Recommendations (at gate)

- Phase 6: composite retrieval sources — do not rewrite Retriever ✅ delivered
- Phase 10+: cutover vector store to Postgres without touching MemoryService ✅ ADR-011

---

*Recorded at gate 2026-07-01. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
