# Phase 5 — Embedding — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-01  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**ADR:** [ADR-003 Implemented](../../../docs/adr/003-embedding-storage-mvp.md)

---

## Purpose

Record what was built: modules, composition wiring, feature flags, and commit sequence.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Implementation planning starts (TASK_PROMPT active) |
| **Updated by** | Implementing AI assistant; maintainer on handoff |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | Tracks milestone checkboxes in roadmap |

---

## Deliverables

| Area | Module / artifact | Status |
|------|-------------------|--------|
| Vector store port | `IEmbeddingStore` — vector SQL isolated from MemoryRepository | ✅ |
| D1 adapter | `D1EmbeddingStore` + `memory_embeddings` table | ✅ |
| Async runner | `EmbeddingJobRunner` — no sync embed on CRUD hot path | ✅ |
| Providers | `noop` default + `openai` opt-in adapter | ✅ |
| Migration | `migrateEmbeddingPhase1` | ✅ |
| Backfill CLI | `npm run db:backfill-embeddings` — dry-run default | ✅ |
| Hybrid prep | Vector source ready for Phase 6 composite retrieval | ✅ |

---

## File map

```
src/embedding/
  embedding.store.interface.ts
  d1-embedding.store.ts
  embedding-job.runner.ts
  create-embedding-provider.ts
  noop-embedding.provider.ts
  openai-embedding.provider.ts
  cosine-similarity.ts
src/db/migrations.ts                   migrateEmbeddingPhase1
scripts/backfill-embeddings.ts
tests/db/embedding-migration.test.ts
tests/embedding/
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `EMBEDDING_PROVIDER` | noop | Embedding API provider |
| `OPENAI_API_KEY` | — | Required when provider=openai |
| `EMBEDDING_MODEL` | text-embedding-3-small | OpenAI model id |

---

## Invariants

- No vector SQL in `MemoryRepository` — ADR-003 port boundary
- CRUD hot path never awaits embed job completion
- content_hash skip on backfill for idempotency

---

## Rollback

`EMBEDDING_PROVIDER=noop` — tables remain; vector leg inactive


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
