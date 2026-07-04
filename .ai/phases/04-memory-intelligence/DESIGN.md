# Phase 4 — Memory Intelligence — DESIGN

**Phase status:** ✅ Closed — gate PASS (2026-07-01  )  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**ADR:** [ADR-004 Repository Port Types](../../adr/004-repository-port-types.md)

**Design archive:** [PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](../../archive/PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md) (full narrative)

---

## Purpose

Intelligent retrieval pipeline: bounded candidate retrieval, ranking, token-budget context assembly, and background consolidation — without loading full corpus into LLM context.

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
REST /api/v1/context  ·  MCP get_context / build_prompt
       │
       ▼
ContextService.buildContext
       │
  Retriever → IRetrievalCandidateSource → IMemoryRepository (SQL projection)
       │
  Ranker → RankingEngine (pure)
       │
  ContextBuilder (token budget) → PromptBuilder
       │
MemoryConsolidator (batch CLI — dedupe, archive, stale promotion)
```

---

## Boundaries

- `MEMORY_SELECT` explicit projection — no full body in retrieval hot path (O-04-2)
- `recordAccessBatch` — single UPDATE for access tracking
- Importance scoring on write path; backfill script dry-run default
- Reserved columns (`embedding_id`, `object_key`) for Phases 5+ — no behavior yet

## Ports & modules

| Port / module | Responsibility |
|---------------|----------------|
| `IRetrievalCandidateSource` | Candidate discovery contract (SQL leg in Phase 4) |
| `Retriever` | Orchestrates source + filters + cap |
| `Ranker` | Wraps pure RankingEngine |
| `ContextBuilder` / `PromptBuilder` | Token-efficient assembly |
| `MemoryConsolidator` | Batch hygiene — no HTTP |

---

## Non-goals

- Embeddings and vector retrieval (Phase 5–6)
- PostgreSQL / R2 / pgvector adapters (Phase 10+)
- Semantic compression (Phase 5.5)
- Hard delete — archive only


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
