# Phase 21 — Search & Graph Production — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateSearchGraphPlatformPhase1()` in `src/db/migrations.ts` (ADR-022).

### Objects

- `search_graph_sync_runs` — sync job history
- `search_graph_sync_state` — watermark per target (Meilisearch/Neo4j)

---

## Verification

[`tests/db/search-graph-platform-migration.test.ts`](../../../tests/db/search-graph-platform-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `SEARCH_GRAPH_PLATFORM_ENABLED=false` — D1/SQL remain SSOT |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
