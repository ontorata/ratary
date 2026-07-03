# ADR-005: Content Object Store (R2 / S3-compatible)

**Status:** Implemented  
**Date:** 2026-07-01  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T2)  
**Deciders:** Project owner  

> **Note:** Numbered 005 because [ADR-002](002-workspace-identity-model.md) reserves the workspace & identity contract (approved pre–Phase 5).

---

## Context

`memories.content` is `TEXT` in D1. Column `object_key` is reserved (Phase 4 M4a). Large bodies do not scale on D1/SQLite. Infrastructure must be replaceable: R2, S3, MinIO.

[ADR-008](008-platform-architecture.md) canonical port name: **`IObjectStorage`** (`src/ports/storage/`). This ADR's original `IContentStore` maps to that port.

[ADR-002](002-workspace-identity-model.md): object keys must be workspace-aware when `workspaceId` is active (`{organizationId}/{workspaceId}/{memoryId}/content` or equivalent).

## Problem

Storing full markdown in D1 optimizes for one backend. Moving to object storage later without a port forces a sweeping rewrite of repositories and context pipeline.

## Constraints

- `object_key` remains opaque pointer on memory row.
- REST/MCP response shapes additive only.
- Constitution: repository = SQL only; byte I/O not in SQL layer.
- Default `OBJECT_STORAGE_PROVIDER=inline` preserves current behavior.
- `IMemoryContentReader` facade deferred to content-offload wiring milestone (not required for adapter landing).

## Decision

**Adopt Option A (port + adapters):**

1. **`IObjectStorage`** — `put`, `get`, `delete`, `exists` with `ObjectStorageKey.segments[]`.
2. **`InlineObjectStorage`** — dev/default (in-memory).
3. **`R2ObjectStorageAdapter`** — Cloudflare R2 via S3-compatible API (`@aws-sdk/client-s3`).
4. Wired at composition root via `createObjectStorage()` when `OBJECT_STORAGE_PROVIDER=r2`.

S3/MinIO reuse the same SDK pattern in a future adapter (same port).

## Env configuration (R2)

| Variable | Required when `r2` |
|----------|---------------------|
| `OBJECT_STORAGE_PROVIDER` | `r2` |
| `R2_BUCKET_NAME` | yes |
| `R2_ACCESS_KEY_ID` | yes |
| `R2_SECRET_ACCESS_KEY` | yes |
| `R2_ACCOUNT_ID` or `CLOUDFLARE_ACCOUNT_ID` | yes |

## Migration (content offload — future milestone)

1. ✅ R2 adapter + env config (Phase 10 T2).
2. `IMemoryContentReader` — resolve inline vs `object_key` (future).
3. Backfill script — upload large rows, set `object_key`, optional inline clear.
4. `ContextBuilder` remains summary-first.

## Rollback

- Keep inline `content` populated during dual-write.
- Set `OBJECT_STORAGE_PROVIDER=inline`; reads use D1 column.
- Blobs in R2 optional to delete; DB remains metadata source of truth.

## References

- [ADR-002 Workspace identity model](002-workspace-identity-model.md)
- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `IObjectStorage` port | `src/ports/storage/iobject-storage.port.ts` |
| `InlineObjectStorage` (default) | `src/infrastructure/storage/inline-object-storage.adapter.ts` |
| `R2ObjectStorageAdapter` | `src/infrastructure/storage/r2-object-storage.adapter.ts` |
| S3-compatible commands (MinIO/AWS) | `src/infrastructure/_shared/s3-object-storage.commands.ts` |
| Factory | `src/infrastructure/composition/create-object-storage.ts` |
| Contract tests | `tests/infrastructure/contracts/iobject-storage.contract.ts` |

**Default:** `OBJECT_STORAGE_PROVIDER=inline`. Content offload via `IMemoryContentReader` and dual-write backfill remain Phase 13 milestones per [10-POST-ROADMAP.md](../../.ai/phases/roadmap/10-POST-ROADMAP.md).
