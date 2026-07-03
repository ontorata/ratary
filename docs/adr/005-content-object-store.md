# ADR-005: Content Offload via IContentStore

**Status:** Proposed  
**Date:** 2026-07-01  
**Deciders:** Project owner  

> **Note:** Numbered 005 because [ADR-002](002-workspace-identity-model.md) reserves the workspace & identity contract (approved pre–Phase 5).

---

## Context

`memories.content` is `TEXT` in D1. Column `object_key` is reserved (Phase 4 M4a). Large bodies do not scale on D1/SQLite (row size, backup, transfer). Context pipeline often needs only `summary`; full `content` for CRUD and export.

Infrastructure must be replaceable: R2, S3, MinIO, local FS.

[ADR-002](002-workspace-identity-model.md): object keys must be workspace-aware when `workspaceId` is active (`{organizationId}/{workspaceId}/{memoryId}/content` or equivalent).

## Problem

Storing full markdown in D1 optimizes for one backend. Moving to object storage later without a port forces a sweeping rewrite of `MemoryRepository`, backup, sync scripts, and context builder.

## Constraints

- `object_key` remains opaque pointer on memory row.
- REST/MCP response shapes additive only (`objectKey` field exists).
- No synchronous upload blocking MCP `save_memory` beyond acceptable latency (async dual-write allowed).
- Constitution: repository = SQL only; byte I/O not in SQL layer.
- Archive-only consolidation; no hard delete of user content without explicit delete.
- Scope keys must align with [ADR-002](002-workspace-identity-model.md) `MemoryScope`.

## Alternatives

### Option A — `IContentStore` port + `IMemoryContentReader` facade

- Pros: Clean DIP; inline `content` during migration; R2/S3 as adapters.
- Cons: Two read paths during transition.

### Option B — Keep all content in D1 until 100k rows

- Pros: No migration work now.
- Cons: Known scale ceiling; painful later migration.

### Option C — External CMS / separate content service

- Pros: Independent scaling.
- Cons: Over-engineered for current repo scope; extra network boundary.

## Decision

**Adopt Option A:**

- `IContentStore` — `put`, `get`, `delete`, `exists` (key derived from `MemoryScope` + `memoryId`).
- `IMemoryContentReader` — resolves inline `content` vs `object_key` for consumers that need body text.
- `MemoryRepository` stores `object_key` only; optional inline `content` during migration period.

## Tradeoffs

- **Gain:** Swap R2 → S3 without touching services.
- **Accept:** Migration script to backfill `object_key` + upload blobs.
- **Accept:** `get_memory` may require extra round-trip to object store when key set.

## Migration

1. Add ports + `InlineContentReader` (reads D1 `content` only) — behavior unchanged.
2. Add `R2ContentStore` adapter + env config.
3. M5b script: upload existing large rows, set `object_key`, optionally clear inline `content` per owner batch.
4. `ContextBuilder` default remains summary-first; full content on demand via `IMemoryContentReader`.

## Rollback

- Keep inline `content` populated during dual-write.
- Set `object_key` null; reads fall back to column.
- Delete blobs optional; DB remains source of truth for metadata.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | Embed text from projection (title+summary+excerpt), not full blob fetch when possible |
| 6 Hybrid Retrieval | Lexical search may index summary in row; full text in object store |
| 7 Agent Runtime | Agents fetch content via same REST/MCP |
| 8 Knowledge Graph | Nodes reference memory id; content at object store |
| 9 Multi AI | Keys scoped per [ADR-002](002-workspace-identity-model.md) workspace |
| 10 Enterprise | Residency / bucket per organization maps to adapter config |

---

## References

- [ADR-002-workspace-identity-model.md](002-workspace-identity-model.md)
- [11-AI-RULES.md](../.ai/core/ai-rules/11-AI-RULES.md)
- [POLICY.md](POLICY.md)
