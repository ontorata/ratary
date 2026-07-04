# Phase 18 — SUCCESS_CRITERIA

| ID | Criterion | Verification |
|----|-----------|--------------|
| SC-18-01 | ADR-033 Approved | ADR status field |
| SC-18-02 | `IControlPlane` port implemented with manual default adapter | Unit tests + composition root |
| SC-18-03 | `IUsageMeter` port implemented; Phase 12 async subscriber | Integration test; hot path unchanged |
| SC-18-04 | `IDisasterRecovery` port wraps existing backup | DR unit + staging drill |
| SC-18-05 | Multi-region topology via `IRegionRegistry` | Integration test assignRegion |
| SC-18-06 | Tenant isolation preserved — resolved `MemoryScope` only | Negative cross-tenant tests |
| SC-18-07 | Admin routes gated by Phase 17 auth/policy | Integration test 403 without admin |
| SC-18-08 | All feature flags default OFF; pre-Phase-18 behavior identical | Full `npm test` default env |
| SC-18-09 | MemoryService unchanged | Empty diff vs baseline |
| SC-18-10 | REST v1 / MCP memory contracts unchanged | Contract tests + REVIEW gate PASS |

## Gate rule

**All SC-18-xx PASS** required before Phase 19 cloud observability panels reference control plane metrics.
