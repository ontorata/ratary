# ADR-013: DuckDB Analytics Store

**Status:** Approved  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phase 9.5 declared `IAnalyticsStore` ([ADR-008](008-platform-architecture.md)). Phase 10 ships `NoOpAnalyticsStore`. Enterprise compliance queries may need an analytics engine separate from transactional SQL.

## Decision

**Adopt DuckDB as dev/staging reference for `IAnalyticsStore`:**

1. `DuckDbAnalyticsStore` in `src/infrastructure/analytics/duckdb/`
2. `ANALYTICS_PROVIDER=duckdb` + `DUCKDB_PATH` (default `:memory:`)
3. Named query templates (`access_count_by_owner`) — no ad-hoc SQL from services
4. Production ClickHouse/Snowflake deferred to future ADRs

Default `ANALYTICS_PROVIDER=none` unchanged.

## References

- [ADR-008 Platform architecture](008-platform-architecture.md)
- [.ai/phases/10-enterprise/IMPLEMENTATION.md](../../.ai/phases/10-enterprise/IMPLEMENTATION.md)
