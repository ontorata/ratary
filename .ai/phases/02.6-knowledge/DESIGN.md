# Phase 2.6 — Knowledge Foundation — DESIGN

**Phase status:** ✅ Closed — gate PASS (2026-06-30  )  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

**Design archive:** [PHASE-2.6-DESIGN.md](../../archive/PHASE-2.6-DESIGN.md) (full narrative)

---

## Purpose

Add structured knowledge metadata (codename, slug, keywords, category, importance) and `memory_relations` graph edges on the existing `memories` table — metadata foundation before authorization, retrieval, and embedding.

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
KnowledgeService (orchestrator)
  ├── CodenameGenerator / SlugGenerator (pure)
  ├── SummaryGenerator / KeywordNormalizer (pure)
  └── MemoryRepository.allocateCodename()

SearchService → RankingEngine (pure) → paginated candidates
MemoryRelationService → memory_relations table
```

---

## Boundaries

- Single SSOT: metadata lives on `memories` — no separate `memory_index` table
- Additive schema only; `summary` column reused (no duplicate column)
- UNIQUE indexes on `(owner_id, codename)` and `(owner_id, slug)` after backfill
- All queries scoped by `owner_id` — cross-owner leak tests mandatory

## Ports & modules

| Port / module | Responsibility |
|---------------|----------------|
| `KnowledgeService` | Orchestrates generators; no SQL |
| `RankingEngine` | Pure scoring — no repository imports |
| `MemoryRelationService` | Relation CRUD scoped by owner_id |

---

## Non-goals

- Semantic / vector search (Phases 5–6)
- Embeddings
- Agent runtime
- `search_score` column — runtime relevance only
- `status` column — use existing `archived` flag


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
