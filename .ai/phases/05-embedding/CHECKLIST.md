# Phase 5 — Embedding — CHECKLIST

**Phase status:** ✅ Closed — gate PASS  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Design archive:** [docs/archive/PHASE-5-EMBEDDING-DESIGN.md](../../../docs/archive/PHASE-5-EMBEDDING-DESIGN.md)  
**ADRs:** [ADR-003](../../../docs/adr/003-embedding-storage-mvp.md) · [ADR-004](../../../docs/adr/004-repository-port-types.md)

---

## Purpose

Executable gate checklist — async embedding layer, `memory_embeddings` store, backfill job, no sync embed on CRUD.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Phase open (Readiness PASS) |
| **Updated by** | Assistant during phase; frozen at gate |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) Phase 5 |

---

## Gate verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **Tests at gate** | 152+ (current suite 427+ with coverage gate) |
| **Completed** | 2026-07-01 |

---

## §16 — Definition of Done (Phase 5)

- [x] `IEmbeddingProvider` + `NoopEmbeddingProvider` with tests  
  — `src/embedding/embedding.provider.interface.ts`, `noop-embedding.provider.ts`  
  — `tests/embedding/noop-embedding.provider.test.ts`, `create-embedding-provider.test.ts`

- [x] `memory_embeddings` table + `D1EmbeddingStore`  
  — `migrateEmbeddingPhase1()` in `src/db/migrations.ts`, `schema.sql`  
  — `src/embedding/d1-embedding.store.ts`  
  — `tests/embedding/d1-embedding.store.test.ts`, `tests/db/embedding-migration.test.ts`

- [x] `EmbeddingJobRunner` + `npm run db:backfill-embeddings`  
  — `src/embedding/embedding-job.runner.ts`  
  — `scripts/backfill-embeddings.ts`, `db:backfill-embeddings:execute`  
  — `tests/embedding/embedding-job.runner.test.ts`, `tests/scripts/embedding-backfill.test.ts`

- [x] `applyEmbeddingBackfill` on `IMemoryWriter`; reader query for missing embeddings  
  — `IMemoryWriter.applyEmbeddingBackfill` — `memory.repository.interface.ts`  
  — `MemoryRepository.applyEmbeddingBackfill` + `findWithoutEmbedding` — `memory.repository.ts`

- [x] OpenAI provider behind env (optional in prod)  
  — `createEmbeddingProvider()` — `EMBEDDING_PROVIDER=noop|openai`, `EMBEDDING_API_KEY`  
  — `src/embedding/openai-embedding.provider.ts`  
  — `tests/embedding/openai-embedding.provider.test.ts`

- [x] No synchronous embed in `insert()` / `update()`  
  — `insert()` sets `embedding_id = null`; embed only via `EmbeddingJobRunner` / backfill script  
  — `MemoryService` write path does not call provider embed

- [x] ARCHITECTURE.md Phase 5 row updated  
  — `docs/ARCHITECTURE.md` capability stack: `Embedding ✅`  
  — `README.md` phase table: `5 — Embedding ✅`

- [x] All existing tests pass; new tests for embedding ports  
  — `tests/embedding/*` (7 files), embedding migration + backfill script tests  
  — Regression: full `npm test` / `npm run test:coverage` green

---

## Key files (evidence index)

| Area | Path |
|------|------|
| Provider port | `src/embedding/embedding.provider.interface.ts` |
| Store port | `src/embedding/embedding.store.interface.ts` |
| Job runner | `src/embedding/embedding-job.runner.ts` |
| Factory | `src/embedding/create-embedding-provider.ts` |
| Env | `EMBEDDING_PROVIDER`, `EMBEDDING_API_KEY`, `EMBEDDING_MODEL` — `src/config/env.ts` |
| Reader/writer split | `IMemoryReader` / `IMemoryWriter` — ADR-004 |

---

## Non-goals (confirmed out of scope)

- Synchronous embed on memory create/update
- pgvector production store (Phase 10 / ADR-011)
- R2 content offload (`object_key`) — later phase
- Retriever ranking changes — Phase 6

---

*Frozen checklist 2026-07-04. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
