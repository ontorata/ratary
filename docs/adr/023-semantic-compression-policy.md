# ADR-023: Semantic Compression Policy

**Status:** Approved  
**Date:** 2026-07-04  
**Approved:** 2026-07-04 (owner — DESIGN + implementation plan)  
**Deciders:** Project owner  

---

## Context

Phases 1–10 are complete. Phase 4 delivered `MemoryConsolidator`, rule-based `generateSummary()` (≤300 chars), and `memory.level` (`raw` | `note` | `summary` | `canonical`). Phase 13 (post-roadmap) targets content scale; workspace multi-AI (Phase 9) increases corpus size per owner.

Architecture Review (2026-07-04) approved **Phase 5.5 Semantic Compression** as an additive track — not a numbered roadmap fork.

Design reference: [.ai/phases/05.5-semantic-compression/DESIGN.md](../../.ai/phases/05.5-semantic-compression/DESIGN.md)

Related: [ADR-005](005-content-object-store.md) (blob offload), [ADR-003](003-embedding-storage-mvp.md) (re-embed summaries).

---

## Problem

| Gap today | Need |
|-----------|------|
| Ad-hoc consolidation rules only | Formal **compression policy** port |
| No compression version / audit metadata | Traceable **compression_meta** on memories |
| Summary creation in consolidator only | **Hierarchical summary** via relations + levels |
| Token-heavy context when bodies hydrated | Coordinate with summary-first context (Phase 6.5) |
| Optional LLM summarization undefined | Async **ICompressionSummarizer** port (no CRUD blocking) |

Without an ADR, Phase 5.5 risks a parallel `compressed_memories` table, destructive deletes, or synchronous LLM on write path.

---

## Constraints

- Constitution §21 additive first; §32 context efficiency; data law (archive, not destroy).
- **No `MemoryService` signature changes**; extend `MemoryConsolidator` only.
- **No new primary table** for compressed content — use `memories` rows + relations.
- MCP/REST contracts additive; `COMPRESSION_ENABLED=false` preserves current behavior.
- LLM summarization **async only** via job port; hot path unchanged.
- Scoped by `MemoryScope` (`ownerId` + optional workspace/org per ADR-002/007/010).
- Implementation blocked until this ADR is **Approved**.

---

## Alternatives

### Option A — Metadata on `memories` + `ICompressionPolicy` port + extend consolidator

- Pros: Single canonical owner; aligns with existing `level` and relations; audit trail via `consolidates` / `derived_from`.
- Cons: Schema additive columns; re-embed job for summary rows.

### Option B — Separate `compressed_memories` table

- Pros: Clear separation of raw vs compressed bytes.
- Cons: Duplicate scope/RBAC logic; violates single canonical owner; rejected.

### Option C — Transport-level compression only (gzip)

- Pros: Simple bytes on wire.
- Cons: Does not reduce stored tokens or LLM context; not semantic; out of domain scope.

---

## Decision

**Adopt Option A** (pending owner Approval):

1. **Ports:** `ICompressionPolicy` (pure), `ICompressionScheduler` (job), optional `ICompressionSummarizer` (async LLM adapter).
2. **Schema (additive):** `memories.compression_meta` (JSON), `memories.compression_version` (INTEGER NULL).
3. **Hierarchy:** New summary rows use `level=summary|canonical`; link sources via `memory_relations` relation type **`consolidates`** (canonical; `derived_from` not used).
4. **Raw handling:** Archive duplicates (`archived=1`); never hard-delete user content.
5. **CLI:** `npm run compress:memories` — dry-run default (mirror `consolidate:memories`).
6. **Env:** `COMPRESSION_ENABLED=false` default; `COMPRESSION_POLICY=rule` default.

---

## Tradeoffs

- Accept additional JSON metadata column vs separate store simplicity.
- Accept async job latency for LLM summaries vs synchronous quality on write.
- Rule-based default may be lossy vs LLM — mitigated by version field and relation trace.

---

## Migration

1. Idempotent migration: add `compression_meta`, `compression_version`.
2. Backfill: null metadata for all existing rows.
3. Optional execute: consolidator/compression job per owner scope.
4. Re-embed summary memories via existing embedding backfill pattern.
5. Coordinate large bodies with ADR-005 / Phase 13 `object_key` migration.

---

## Rollback

1. Set `COMPRESSION_ENABLED=false`.
2. New summary rows remain valid memories (no schema rollback required for gate).
3. Column drop deferred — append-only migration policy; columns nullable.

---

## Impact on future phases

| Phase / track | Impact |
|---------------|--------|
| 6.5 Progressive Retrieval | Prefer `summary`/`canonical` levels in policy |
| 7.5 Runtime Compatibility | `supportsSemanticCompression` in manifest |
| 8.5 Quality Signals | Consolidation hints trigger compression |
| 11 Production Ops | Postgres migration includes new columns |
| 12 Event Pipeline | Optional `memory.compressed` event |
| 13 Content Scale | Blob offload + compression metadata |

---

## References

- [.ai/phases/05.5-semantic-compression/DESIGN.md](../../.ai/phases/05.5-semantic-compression/DESIGN.md)
- [ADR-005](005-content-object-store.md)
- [00-CONSTITUTION.md](../../.ai/core/constitution/00-CONSTITUTION.md)
- [04-ARCHITECTURE.md](../../.ai/core/architecture/04-ARCHITECTURE.md)
- [POLICY.md](POLICY.md)
