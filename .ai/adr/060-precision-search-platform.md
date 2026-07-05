# ADR-060: Precision Search Platform

**Status:** Implemented  
**Date:** 2026-07-05  
**Approved:** 2026-07-05 (owner)  
**Implemented:** 2026-07-05 (commit `66d72dc`, waves 6.6A–E)  
**Deciders:** Project owner  
**Phase:** [06.6-precision-search](../phases/06.6-precision-search/README.md)

---

## Context

Ratary implements hybrid retrieval (Phase 6), progressive context assembly (Phase 6.5), Meilisearch/Neo4j production sync (Phase 21), and OpenAI-compatible embeddings (Phase 5). Search browse (`SearchService`) and LLM retrieval (`Retriever` + RRF) share memory records but lack explicit **search modes**, **multi-query fusion**, **path/alias surface**, and **post-retrieval reranking** — capabilities expected by AI engineers comparing vault-native search tools.

Phase **06.6** formalizes a **Precision Search Platform** layer without rewriting `MemoryService` or embedding agent runtime in `src/`.

---

## Problem

| Gap | Impact |
|-----|--------|
| Single implicit search path | Agents cannot request title-only vs semantic vs hybrid explicitly |
| One query string per request | Vocabulary mismatch reduces recall |
| Codename/slug without aliases[] | Frontmatter-style aliases not first-class |
| No similar-by-memory API | Cannot find related memories without crafting a new query |
| Graph traverse always bidirectional | Callers cannot request outgoing-only / backlinks-only |
| Search hits omit link envelope | Agents re-fetch relations per hit |
| No rerank stage | Precision suffers on conceptual queries |
| No local embedding adapter | Offline / air-gapped deploy requires external API |

---

## Constraints

- Constitution: **no agent planner/executor** in repo — search serves MCP/REST consumers only.
- **Default OFF** via `PRECISION_SEARCH_ENABLED=false` until gate PASS.
- **Additive API** — existing search/context contracts remain valid with defaults.
- **Ports-first** — BM25/fuzzy/rerank/local embed behind adapters; D1 default path unchanged when flag OFF.
- Search browse vs retrieval inject boundary preserved (ADR-001, ADR-024).

---

## Alternatives

### Option A — Extend SearchService only

- Pros: Smallest surface; fast MVP.
- Cons: Duplicates RRF logic; context pipeline unchanged; modes diverge between browse and retrieve.

### Option B — Unified IPrecisionSearchPort (chosen)

- Pros: One orchestrator for REST `/search`, MCP `search_memory`, and optional retrieval pre-step; modes + multi-query + rerank in one place; capability manifest discoverable.
- Cons: New port + composition wiring; more tests.

### Option C — External search sidecar (Meilisearch-only)

- Pros: Offload BM25/rerank to vendor.
- Cons: Violates self-host D1-default story; duplicates owner scope logic.

## Decision

**Option B** — introduce `IPrecisionSearchService` (application layer) coordinating:

1. Mode-specific candidate sources (sql lexical, vector, meilisearch when enabled)
2. Multi-query RRF merge (query list, not only multi-source)
3. Optional `IReranker` port (ONNX cross-encoder, default noop)
4. Knowledge surface enricher (aliases, sourcePath, links, backlinks on hits)
5. Filter grammar for scope/tags (multi-value + exclusion)

Existing `CompositeRetrievalCandidateSource` remains for **context retrieval**; precision search **may reuse** the same sources via registered adapters but does not replace `ContextService` policy path.

---

## Tradeoffs

- Accept new DDL (`aliases`, `source_path`, optional `memory_chunks`) for vault parity.
- Accept optional ~570 MB rerank model download when `--rerank` / env enabled.
- Local embeddings add Node native deps — gated behind `EMBEDDING_PROVIDER=local` (Phase 5.6 track).

---

## Migration

1. **06.6A** — DDL + backfill script (aliases from keywords optional); API additive fields.
2. **06.6B** — `IPrecisionSearchService` + REST query params; MCP `search_memory` extension.
3. **06.6C** — Rerank + multi-query; manifest flags.
4. **06.6D** — Similar-memory + graph direction param on traverse (additive).
5. **06.6E** — CLI `@ratary/cli search` parity (optional, depends Phase 16).

Rollback: disable `PRECISION_SEARCH_ENABLED`; legacy `SearchService` path unchanged.

---

## Rollback

Set `PRECISION_SEARCH_ENABLED=false`. New columns nullable — no read dependency when OFF. Rerank and local embed adapters not loaded when env unset.

---

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | Optional **05.6** local adapter shares embed port |
| 6 Hybrid Retrieval | Reuses vector/sql legs; no Retriever rewrite |
| 6.5 Progressive Retrieval | Orthogonal — context policy unchanged |
| 16 Developer Platform | CLI search subcommands |
| 21 Search Graph Prod | Meilisearch leg registered in precision orchestrator |
| 23 Knowledge Fabric | `source_path` aligns with connector ingest |

---

## References

- [ADR-001](001-multi-source-retrieval.md) — RRF multi-source
- [ADR-014](014-meilisearch-retrieval-source.md) — Lexical leg
- [ADR-024](024-progressive-retrieval-policy.md) — Context vs search boundary
- [Phase 06.6 DESIGN](../phases/06.6-precision-search/DESIGN.md)
