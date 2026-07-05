# Phase 04.7 — Self-Managing Memory Stewardship — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-045 Accepted](../../adr/045-self-managing-memory-stewardship.md)  
**Initial commit:** `94c7359` · **Follow-up:** seven-task pipeline, SQL store, MCP, scheduler

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Ports | `IMaintenanceTask`, `IMemoryStewardshipOrchestrator`, `IStewardshipRunStore`, `IStewardshipScheduler` | ✅ |
| Types | `STEWARDSHIP_STAGE_ORDER`, `STAGE_INDEX`, `StewardshipRunReport` | ✅ |
| Orchestrator | `MemoryStewardshipOrchestrator` — sort, run, isolate errors, persist | ✅ |
| Run store | `InMemoryStewardshipRunStore` (default) · `SqlStewardshipRunStore` (opt-in) | ✅ |
| Scheduler | `LocalStewardshipScheduler` when `MEMORY_STEWARDSHIP_SCHEDULER=local` | ✅ |
| Tasks | MetadataAudit, Consolidation, GraphRepair, EmbeddingAudit, IndexRepair, RankingRefresh, RetrievalOptimization | ✅ |
| Composition | `create-memory-stewardship-ports.ts` | ✅ |
| Env | `MEMORY_STEWARDSHIP_*` flags in `src/config/env.ts` | ✅ |
| CLI | `steward:memories` / `steward:memories:execute` | ✅ |
| MCP | `run_stewardship` tool | ✅ |
| Manifest | `capabilities.supportsSelfManagement` | ✅ |
| Migration | `stewardship_runs` table (`migrateExtensionTracksPhase7`) | ✅ |
| Docs | DESIGN, README, ADR-045, 04-ARCHITECTURE | ✅ |

---

## File map

```
src/memory/stewardship/
  tasks/metadata-audit.task.ts
  tasks/consolidation.task.ts
  tasks/graph-repair.task.ts
  tasks/embedding-audit.task.ts
  tasks/index-repair.task.ts
  tasks/ranking-refresh.task.ts
  tasks/retrieval-optimization.task.ts
  in-memory-stewardship-run-store.ts
  memory-stewardship-orchestrator.ts
src/infrastructure/stewardship/sql-stewardship-run-store.ts
src/jobs/local-stewardship-scheduler.ts
src/ports/stewardship/istewardship-scheduler.port.ts
src/composition/create-memory-stewardship-ports.ts
scripts/steward-memories.ts
src/transport/mcp/mcp-server.ts          # run_stewardship
tests/memory/stewardship/*.test.ts
tests/infrastructure/stewardship/sql-stewardship-run-store.test.ts
tests/jobs/local-stewardship-scheduler.test.ts
tests/mcp/tools.test.ts                  # run_stewardship
```

---

## Wiring

```typescript
createMemoryStewardshipPorts(sql, env) → {
  enabled: env.MEMORY_STEWARDSHIP_ENABLED,
  orchestrator: MemoryStewardshipOrchestrator([
    MetadataAuditTask,
    ConsolidationTask(consolidator),
    GraphRepairTask(relationInference),
    EmbeddingAuditTask,
    IndexRepairTask(searchGraph),
    RankingRefreshTask(learning),
    RetrievalOptimizationTask,
  ], { runStore }),
  runStore: env.MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER === 'sql'
    ? SqlStewardshipRunStore : InMemoryStewardshipRunStore,
  scheduler: env.MEMORY_STEWARDSHIP_SCHEDULER === 'local'
    ? LocalStewardshipScheduler : undefined,
}
```

---

## Non-regression

- `MemoryService` signatures unchanged
- Master flags OFF by default — zero behavior change on deploy
- **710** tests passed | 3 skipped (full suite)

---

## Rollback

1. Set `MEMORY_STEWARDSHIP_ENABLED=false`
2. Set `MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER=memory` (default)
3. `stewardship_runs` table is append-only — safe to leave in place
