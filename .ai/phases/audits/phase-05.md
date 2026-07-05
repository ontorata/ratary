# Audit: Phase 05 — Embedding

**Audit ID:** `audits/phase-05`  
**Phase:** 5 — Embedding  
**Date:** 2026-07-03  
**Auditor:** Architecture review (AI-assisted)  
**Verdict:** **PASS WITH OBSERVATIONS**

---

## Scope

Async embedding backfill, `IEmbeddingProvider`, `IEmbeddingStore`, `memory_embeddings`, orphan cleanup, ADR-003 and ADR-004 Implemented.

**Evidence:** [phases/05-embedding/](../05-embedding/README.md) · [phases/05-embedding/COMPLETION.md](../05-embedding/COMPLETION.md) · [.ai/archive/PHASE-5-EMBEDDING-DESIGN.md](../archive/PHASE-5-EMBEDDING-DESIGN.md)

---

## Success criteria

| Criterion | Result | Evidence |
|-----------|--------|----------|
| No sync embed on CRUD | PASS | EmbeddingJobRunner async |
| No vector SQL in MemoryRepository | PASS | D1EmbeddingStore |
| Idempotent backfill | PASS | content_hash skip |
| REST/MCP contracts unchanged | PASS | Regression suite |
| ADR-003, ADR-004 Implemented | PASS | ADR status |
| 152+ tests at close | PASS | Vitest |

---

## Architecture compliance

| Rule | Compliant | Notes |
|------|-----------|-------|
| embedding/ module isolation | Yes | Own store and provider |
| Composition Root wiring | Yes | create-memory-service.ts |
| Port swap path documented | Yes | Vectorize/pgvector future |
| MVP scale documented | Yes | ~5–10k vectors/owner |

---

## Observations (accepted debt)

| ID | Observation | Severity | Deferred to | Status |
|----|-------------|----------|-------------|--------|
| ~~O-05-1~~ | ~~Duplicate MemoryRepository in composition roots~~ | Medium | ~~Phase 6 wiring~~ | **✅ RESOLVED** |
| ~~O-05-2~~ | ~~schema.sql drift from migrations.ts intelligence columns~~ | Medium | ~~Phase 6 or maintenance~~ | **✅ RESOLVED** |
| ~~O-05-3~~ | ~~MVP vector scale ceiling~~ | Low | ~~Documented; adapter swap path~~ | **✅ RESOLVED** (Phase 10 — ADR-011 `PgVectorStoreAdapter`, `VECTOR_PROVIDER=pgvector`) |

---

## Gate alignment

Phase 5 marked ✅ in roadmap (2026-07-01). Ready for Phase 6 design pending ADR-001.

---

## Addendum 2026-07-03

- **D-02 RESOLVED**: schema.sql synced with all Phase 4 indexes
- **D-03 RESOLVED**: IMemoryRelationRepository interface created
- Quality gate: **172 tests passing** (20 more than at phase close)
- Typed errors: `ValidationError` now used in embedding providers
- Embedding layer stable

## Addendum 2026-07-04

- **O-05-3 RESOLVED**: MVP vector scale ceiling — adapter swap path implemented in Phase 10 (`PgVectorStoreAdapter`, ADR-011 Implemented; `VECTOR_PROVIDER=pgvector` opt-in). D1 JSON store remains default for small deployments.

---

*Read-only.*
