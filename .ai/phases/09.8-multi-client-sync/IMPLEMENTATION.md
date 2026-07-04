# Phase 09.8 — Multi-Client Sync — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-042 Accepted](../../../docs/adr/042-multi-client-memory-sync.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Stale detector | Shared `SyncStaleDetector` for audit | ✅ |
| Resolvers | LWW, field merge, manual queue | ✅ |
| Sync manager | `ConflictAwareSyncManager` when flag ON | ✅ |
| Stores | `sync_cursors`, `sync_conflicts` + SQL adapters | ✅ |
| Service | `ClientSyncService` pull/push/status | ✅ |
| MemoryService | Reject on `reconcileWrite === 'reject'` | ✅ |
| REST | `GET /sync/status`, `/sync/pull`, `POST /sync/push` | ✅ |
| CLI | `sync:status` | ✅ |
| Composition | `create-multi-client-sync-ports.ts` | ✅ |
| Manifest | `supportsMultiClientSync` | ✅ |

---

## File map

```
src/client-sync/
  client-sync.types.ts
  client-sync.constants.ts
  client-sync.service.ts
  conflict-aware-sync-manager.ts
  conflict-resolvers.ts
  default-client-platform-registry.ts
  iconflict-resolver.interface.ts
  isync-cursor-store.port.ts
  isync-conflict-store.port.ts
  iclient-platform-registry.interface.ts
  iclient-sync-service.interface.ts
  index.ts
src/sync/sync-stale-detector.ts
src/infrastructure/client-sync/
  sql-sync-cursor-store.ts
  sql-sync-conflict-store.ts
src/composition/create-multi-client-sync-ports.ts
src/controllers/client-sync.controller.ts
src/routes/v1/client-sync.routes.ts
scripts/sync-status.ts
```

---

## Wiring

```typescript
createMultiClientSyncPorts(sql, env, audit) → { syncManager, createService, strategy }

createMultiAiPorts(db, env) → { syncManager: clientSync.syncManager, clientSync, bindClientSyncService }

createMemoryService(..., multiAi)  // uses ConflictAwareSyncManager when enabled
bindClientSyncService(memoryService) → ClientSyncService for REST
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `MULTI_CLIENT_SYNC_ENABLED` | `false` | Master switch |
| `MULTI_CLIENT_SYNC_STORE_PROVIDER` | `none` | `sql` \| `none` |
| `MULTI_CLIENT_SYNC_STRATEGY` | `lww` | `lww` \| `field_merge` \| `manual_queue` |

---

## Rollback

Set `MULTI_CLIENT_SYNC_ENABLED=false`; `AcceptSyncManager` accept-all path only. Cursor/conflict rows remain.
