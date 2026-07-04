# ADR-038: Usage Analytics Engine (Phase 25)

**Status:** Implemented
**Date:** 2026-07-04
**Deciders:** Project owner

---

## Context

Telemetry (ADR-037) produces content-free events. Phase 25 needs an engine that **derives** knowledge/memory quality, search precision, adoption, cost, and latency — turning signals into actionable intelligence for teams and enterprise FinOps.

Design: [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md) §4, §9.

## Problem

Without analytics, operators cannot measure whether knowledge is effective, whether AI adoption is growing, or where cost/latency concentrate — and cannot optimize.

## Constraints

- **Read-only** derivations; never mutate SSOT (Vision #3).
- Storage-agnostic analytics store (ADR-013 reference; swappable).
- Scope-bound; no cross-tenant blending; erasure cascades.
- Off the CRUD hot path (async aggregate pipeline).

## Alternatives

### Option A — Compute analytics inside MemoryService
- Pros: co-located.
- Cons: violates layer separation + single responsibility; couples SSOT to analytics; rejected.

### Option B — Dedicated read-only analytics service over a store port (chosen)
- Pros: clean separation, swappable store, no SSOT write path.
- Cons: needs aggregate pipeline + query port.

### Option C — External BI tool only
- Pros: no core code.
- Cons: no in-repo KPI governance; inconsistent definitions across deployments.

## Decision

Adopt `IUsageAnalyticsService` (memory quality, knowledge quality, search precision, retrieval success, context effectiveness, adoption, workspace health, cost, token consumption, latency) backed by `IAnalyticsQueryPort` over the ADR-013 store (DuckDB/ClickHouse adapters). Append-only aggregates; no path back into `memories`. Surfaced via REST `/api/v1/analytics/*`, MCP report tools, and Grafana packs.

## Tradeoffs

Accept an async aggregate pipeline and query port for governed, consistent, SSOT-safe KPIs.

## Migration

Add store adapter + query port → analytics service → REST/MCP report surfaces → Grafana packs. Additive, gated.

## Rollback

Disable analytics surfaces / master flag OFF; aggregates dormant; SSOT untouched.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 8.5 Quality signals | Analytics consumes ADR-026 signals |
| 19 Observability | KPIs surface in Grafana packs |
| L21–L30 Learning | Learning policy may read analytics (read-only) |

---

## References

- [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md)
- [ADR-013 DuckDB analytics store](013-duckdb-analytics-store.md) · [ADR-026 memory quality signals](026-memory-quality-signals.md)
- [POLICY.md](POLICY.md)
