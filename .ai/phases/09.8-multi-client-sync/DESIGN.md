# Phase 09.8 — Multi-Client Sync — DESIGN

**ADR gate:** ADR-042 Accepted · **Extends:** Phase 9 `ISyncManager`

## Purpose

Synchronize workspace memory across AI clients (Cursor, Claude, ChatGPT, Gemini, Codex, Qwen, OpenHands, Continue, MCP servers). Hub remains SSOT; clients pull/push with **required conflict resolution**.

## Distinct from

Phase 14 federation (node-to-node exchange). Phase 09.8 is **client-to-hub** sync only.

## Ports

| Port | Role |
|------|------|
| `IClientSyncService` | Pull/push/status orchestration |
| `IConflictResolver` | Stale write strategy (LWW, field merge, manual queue) |
| `ISyncCursorStore` | Per-platform incremental watermark |
| `ISyncConflictStore` | Manual conflict queue |
| `IClientPlatformRegistry` | Known client platform profiles |

## Conflict strategies

| Strategy | Reconcile behavior | Push behavior |
|----------|-------------------|---------------|
| `lww` (default) | Reject stale writes | Propagate 409 on conflict |
| `field_merge` | Accept stale writes | Merge non-null fields + tag union |
| `manual_queue` | Reject + queue row | Queue payload for operator review |

Optional branch merge via Phase 09.7 evolution is deferred — evolution archives remain independent.

## Side stores

- `sync_cursors` — `(owner_id, workspace_id, platform_id) → cursor_value`
- `sync_conflicts` — pending manual resolution queue

## Invariants

- `memories` remains authoritative current head
- Manual `memory_relations` edges never overwritten (unchanged)
- Flag off → `AcceptSyncManager` only (audit, always accept)
- Flag on → `ConflictAwareSyncManager` enforces resolver

## REST (gated)

```
GET  /api/v1/sync/status?platformId=cursor
GET  /api/v1/sync/pull?platformId=cursor&cursor=<iso>
POST /api/v1/sync/push  { platformId, changes[], cursor? }
```

## Rollback

Set `MULTI_CLIENT_SYNC_ENABLED=false`. Cursor/conflict rows remain; reconcile reverts to accept-all.
