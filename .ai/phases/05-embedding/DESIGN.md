# Phase 5 — Embedding — DESIGN

**Phase status:** ✅ Closed — gate PASS (2026-07-01  )  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**ADR:** [ADR-003 Embedding Storage MVP](../../../docs/adr/003-embedding-storage-mvp.md)

**Design archive:** [PHASE-5-EMBEDDING-DESIGN.md](../../../docs/archive/PHASE-5-EMBEDDING-DESIGN.md) (full narrative)

---

## Purpose

Async embedding pipeline: generate and store vectors behind ports without blocking CRUD. Prepare Phase 6 hybrid retrieval via `IEmbeddingStore.searchSimilar`.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase begins — before implementation commits |
| **Updated by** | AI assistant drafts; owner approves; ADR author if structural |
| **Read-only when** | Phase gate PASS — frozen as historical design record |
| **Roadmap relation** | Captures scope and architecture evolution row |

---

## Architecture

```
MemoryService (create/update) — no sync embed
       │
       ▼ (async)
EmbeddingJobRunner → IEmbeddingProvider.embed(batch)
       │
       ▼
IEmbeddingStore.upsert(memoryId, vector, modelId)
       │
       ▼
IMemoryRepository.setEmbeddingId (pointer on memories row)
```

---

## Boundaries

- Constitution rule: never call `embed()` inside synchronous insert/update
- Vectors in `memory_embeddings` table — lightweight `embedding_id` pointer on memories
- Idempotent backfill with content_hash skip
- Default `EMBEDDING_PROVIDER=noop` — zero external API cost

## Ports & modules

| Port / module | Responsibility |
|---------------|----------------|
| `IEmbeddingProvider` | Vendor-neutral embed API (noop default, openai opt-in) |
| `IEmbeddingStore` | Vector persistence — no vector SQL in MemoryRepository |
| `EmbeddingJobRunner` | Async batch processor |

---

## Non-goals

- Hybrid SQL+vector fusion ranking (Phase 6)
- Content offload to R2 (`object_key` wiring deferred)
- Real-time embed-on-every-read
- New MCP tools (contract unchanged at Phase 5 close)


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
