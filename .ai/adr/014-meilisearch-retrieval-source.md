# ADR-014: Meilisearch Retrieval Source

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T7)  
**Deciders:** Project owner  

---

## Context

Lexical search today flows through `SqlRetrievalCandidateSource` → `IMemoryRepository` (ADR-001). External search engines must integrate **without changing** `SearchService`, `Retriever`, or merge logic.

## Decision

**Adopt Meilisearch as an opt-in lexical retrieval source:**

1. `MeilisearchRetrievalSource` in `src/infrastructure/search/meilisearch/`
2. Implements domain port `IRetrievalCandidateSource` — not a new `src/ports/` family
3. Wired via `createLexicalRetrievalSource()` in `createContextService` when `SEARCH_PROVIDER=meilisearch`
4. Owner scoping via Meilisearch filter (`owner_id`, optional `workspace_id`, `project_id`)
5. Hydrates hits through `IMemoryReader.findByIds` — no MCP/REST shape changes

Index sync (write-through / async backfill) out of scope for adapter-only landing.

Default `SEARCH_PROVIDER=sql` unchanged.

## Migration

1. Deploy source behind `SEARCH_PROVIDER=meilisearch`
2. Backfill index from memories (script; deferred)
3. Rollback: `SEARCH_PROVIDER=sql`

## References

- [ADR-001 Multi-source retrieval](001-multi-source-retrieval.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `MeilisearchRetrievalSource` | `src/infrastructure/search/meilisearch/meilisearch-retrieval-source.ts` |
| Factory (lexical source selection) | `src/infrastructure/composition/create-lexical-retrieval-source.ts` |
| Wired in | `src/memory/create-context-service.ts` |

**Default:** `SEARCH_PROVIDER=sql`. Index backfill script deferred to Phase 14.
