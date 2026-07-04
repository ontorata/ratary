# Phase 09.8 — Multi-Client Sync — DESIGN

**ADR gate:** ADR-042 Proposed · **Extends:** Phase 9 ISyncManager

## Purpose

Synchronize workspace memory across AI clients. Extends AcceptSyncManager with `IConflictResolver` strategies (LWW, field merge, manual queue, optional branch via 09.7).

## Ports

`IClientSyncService`, `IConflictResolver`, `ISyncCursorStore`, `IClientPlatformRegistry`

## Distinct from

Phase 14 federation (node-to-node)
