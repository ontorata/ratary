# Phase 6.6 — Precision Search Platform — DELIVERY TRACK

**Status:** ✅ Waves 6.6A–E complete (2026-07-05)  
**Authority:** [DESIGN.md](DESIGN.md) · [ADR-060](../../adr/060-precision-search-platform.md)

---

## Ship order

```mermaid
flowchart LR
  A[6.6A Surface + filters] --> B[6.6B Modes + API]
  B --> C[6.6C Multi-query + snippets]
  C --> D[6.6D Similar + graph + path read]
  D --> E[6.6E Rerank + local embed]
```

| Wave | ID | Deliverable | Verify |
|------|-----|-------------|--------|
| **6.6A** | D66-A1 | DDL `aliases`, `source_path` + migration | ✅ `tests/db/precision-search-migration.test.ts` |
| **6.6A** | D66-A2 | `SearchFilterGrammar` parser + SQL builder | ✅ `tests/search/search-filter-grammar.test.ts` |
| **6.6A** | D66-A3 | `ignore-patterns.ts` + env wiring | ✅ `tests/search/ignore-patterns.test.ts` |
| **6.6B** | D66-B1 | `IPrecisionSearchService` + orchestrator | ✅ `src/search/precision/precision-search-orchestrator.ts` |
| **6.6B** | D66-B2 | REST extend `/search` + capabilities manifest | ✅ search params + `precisionSearch` manifest |
| **6.6B** | D66-B3 | MCP extend `search_memory` | ✅ `tests/mcp/tools.test.ts` |
| **6.6C** | D66-C1 | `IMultiQueryFusion` RRF | ✅ `tests/search/multi-query-rrf.test.ts` |
| **6.6C** | D66-C2 | `ISearchResultEnricher` snippets | ✅ `tests/search/search-result-enricher.test.ts` |
| **6.6C** | D66-C3 | Extended hit envelope (links/backlinks) | ✅ enricher cap in orchestrator |
| **6.6D** | D66-D1 | `GET /memory/similar` + vector/fallback | ✅ REST + orchestrator fallback |
| **6.6D** | D66-D2 | `GET /memory/by-path` + fuzzy suggest | ✅ REST + MCP `get_memory_by_path` |
| **6.6D** | D66-D3 | Graph `direction` + slug/path seed | ✅ `tests/graph/graph-direction.test.ts` |
| **6.6D** | D66-D4 | MCP `get_memory_by_path` | ✅ MCP tool registered |
| **6.6E** | D66-E1 | `IReranker` + ONNX adapter (opt-in) | ✅ `tests/search/rerank.test.ts` |
| **6.6E** | D66-E2 | Phase **05.6** local embedding provider | ✅ `tests/embedding/local-embedding.provider.test.ts` |
| **6.6E** | D66-E3 | `@ratary/cli search` flags (Phase 16 coord) | ✅ `packages/cli` `--mode --extended --rerank` |

---

## Dependency graph

| Wave | Requires |
|------|----------|
| 6.6A | Phase 2.6 knowledge columns (codename/slug exist) |
| 6.6B | ADR-060 Approved |
| 6.6C | 6.6B |
| 6.6D | 6.6A (source_path), Phase 8 graph |
| 6.6E | 6.6C; Phase 5 embed port; optional Phase 21 Meilisearch for BM25 quality |

---

## Flag rollout

| Stage | Env |
|-------|-----|
| Dev | `PRECISION_SEARCH_ENABLED=true` in local `.env` only |
| Staging | + `SEARCH_RERANK_ENABLED` smoke |
| Production | Default OFF until gate PASS + owner approval |
