# ADR-043: Cloud Federation Sync Topology (Phase 25)

**Status:** Implemented  
**Date:** 2026-07-04  

---

## Decision

Five-tier sync model (`workspace` → `organization` → `cloud` → `edge` → `developer`) orchestrated by `IGlobalSyncOrchestrator` delegating to Phase 14 `IKnowledgeExchangeService`. Offline reconcile via `IOfflineJournal`. Conflict policy remains in federation layer — orchestrator does not duplicate business logic.

Implementation: `src/intelligence/sync/`.
