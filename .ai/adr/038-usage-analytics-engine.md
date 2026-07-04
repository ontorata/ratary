# ADR-038: Usage Analytics Engine (Phase 25)

**Status:** Implemented  
**Date:** 2026-07-04  

---

## Decision

Read-only `IUsageAnalyticsService` deriving adoption, workspace health, cost, and context effectiveness KPIs from telemetry store. Never writes `memories` (SSOT). SQL-backed aggregates via `SqlIntelligenceStore` in MVP.

Implementation: `src/intelligence/analytics/`.
