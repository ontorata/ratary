# ADR-042: Multi-Client Memory Synchronization (Phase 09.8)

**Status:** Accepted  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 9 `AcceptSyncManager` accepts all writes with conflict audit only. Multiple AI clients (Cursor, Claude, etc.) need pull/push sync with **conflict resolution**.

Design: [.ai/phases/09.8-multi-client-sync/DESIGN.md](../../.ai/phases/09.8-multi-client-sync/DESIGN.md)

## Decision

Adopt `IClientSyncService` + `IConflictResolver` registry; platform profiles; workspace SSOT. Strategies: `lww` (default), `field_merge`, `manual_queue`. Side stores: `sync_cursors`, `sync_conflicts`. `MULTI_CLIENT_SYNC_ENABLED=false` default.

### Implementation (2026-07-04)

- `ConflictAwareSyncManager` replaces accept-only reconcile when flag ON
- `MemoryService` throws `SyncConflictError` (409) on reject
- REST: `GET /api/v1/sync/status`, `/sync/pull`, `POST /sync/push`
- CLI: `npm run sync:status`
- Manifest: `supportsMultiClientSync`

## Consequences

- Clients must send `expectedUpdatedAt` on update/delete for stale detection
- Distinct from Phase 14 federation (node-to-node)

## Rollback

Disable flag; `AcceptSyncManager` behavior only. Cursor/conflict rows remain.
