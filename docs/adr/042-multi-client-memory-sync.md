# ADR-042: Multi-Client Memory Synchronization (Phase 09.8)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 9 `AcceptSyncManager` accepts all writes with conflict audit only. Multiple AI clients (Cursor, Claude, etc.) need pull/push sync with **conflict resolution**.

Design: [.ai/phases/09.8-multi-client-sync/DESIGN.md](../../.ai/phases/09.8-multi-client-sync/DESIGN.md)

## Decision

Adopt `IClientSyncService` + `IConflictResolver` registry; platform profiles; workspace SSOT. `MULTI_CLIENT_SYNC_ENABLED=false` default.

## Rollback

Disable flag; AcceptSyncManager behavior only.
