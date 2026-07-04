# ADR-036: Global AI Intelligence Platform (Phase 25)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Decision

Capstone Phase 25 module `src/intelligence/` composing Phase 14/18/19 ports: semantic telemetry, read-only usage analytics, and 5-tier global sync orchestration. Master flag `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false` (default). `MemoryService` unchanged.

## Implementation

- `TelemetryRecorder` + `IntelligenceTelemetryConsumer` (Phase 12 events)
- `UsageAnalyticsService` (read-only KPI derivations)
- `GlobalSyncOrchestrator` + `SqlOfflineJournal` over Phase 14 exchange
- REST `/api/v1/intelligence/*`
- Capabilities `globalIntelligence` section

See [.ai/phases/25-global-ai-intelligence/IMPLEMENTATION.md](../phases/25-global-ai-intelligence/IMPLEMENTATION.md).
