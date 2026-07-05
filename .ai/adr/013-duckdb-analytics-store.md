# ADR-013: DuckDB Analytics Store

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Implemented:** 2026-07-03 (Phase 10 T6)  
**Deciders:** Project owner  

---

## Context

Phase 9.5 declared `IAnalyticsStore` ([ADR-008](008-platform-architecture.md)). Phase 10 ships `NoOpAnalyticsStore`. Enterprise compliance queries may need an analytics engine separate from transactional SQL.

## Problem

Compliance and access-pattern analytics should not run ad-hoc SQL against D1/Postgres metadata from services. Without a port-backed reference adapter, Phase 12 event fan-out lacks a declared analytics sink.

## Constraints

- `IAnalyticsStore` contract unchanged — named query templates only; no ad-hoc SQL from services.
- Default `ANALYTICS_PROVIDER=none` preserves behavior.
- DuckDB is **dev/staging reference**; production ClickHouse/Snowflake require future ADRs.
- No DuckDB imports outside `src/infrastructure/analytics/duckdb/`.

## Alternatives

### Option A — DuckDB reference adapter

- Pros: Local/dev friendly; proves port; supports compliance query templates.
- Cons: Not production OLAP at scale.

### Option B — Defer until Phase 12 event pipeline

- Pros: Less code now.
- Cons: No contract harness for analytics port before consumers.

## Decision

**Adopt Option A — DuckDB as dev/staging reference for `IAnalyticsStore`:**

1. `DuckDbAnalyticsStore` in `src/infrastructure/analytics/duckdb/`
2. `ANALYTICS_PROVIDER=duckdb` + `DUCKDB_PATH` (default `:memory:`)
3. Named query templates (`access_count_by_owner`) — no ad-hoc SQL from services
4. Reference DDL for `memory_access_events` (async fan-out schema — not hot path in Phase 10)

Default `ANALYTICS_PROVIDER=none` unchanged.

## Tradeoffs

- **Gain:** Analytics port proven; aligns with [ADR-017](017-memory-access-audit.md) future fan-out.
- **Accept:** Production analytics engine deferred.

## Migration

1. Deploy adapter; keep `ANALYTICS_PROVIDER=none`.
2. Enable `duckdb` in dev/staging for query template validation.
3. Rollback: `ANALYTICS_PROVIDER=none`.

## Rollback

Set `ANALYTICS_PROVIDER=none`. DuckDB file optional to delete.

## References

- [ADR-008 Platform architecture](008-platform-architecture.md)
- [ADR-017 Memory access audit](017-memory-access-audit.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)

---

## Implementation evidence

| Artifact | Location |
|----------|----------|
| `DuckDbAnalyticsStore` | `src/infrastructure/analytics/duckdb/duckdb-analytics-store.adapter.ts` |
| Executor interface (testability) | `src/infrastructure/analytics/duckdb/duckdb-executor.interface.ts` |
| `NoOpAnalyticsStore` (default) | wired via `createAnalyticsStore()` |
| Factory | `src/infrastructure/composition/create-analytics-store.ts` |
| Contract tests | `tests/infrastructure/contracts/ianalytics-store.contract.ts` |

**Default:** `ANALYTICS_PROVIDER=none`.
