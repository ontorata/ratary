# Phase 04.7 — Self-Managing Memory Stewardship — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-045 Accepted](../../../docs/adr/045-self-managing-memory-stewardship.md)  
**Commit:** `94c7359` feat(memory): implement Phase 04.7 self-managing memory stewardship

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Ports | `IMaintenanceTask`, `IMemoryStewardshipOrchestrator`, `IStewardshipRunStore` | ✅ |
| Types | `STEWARDSHIP_STAGE_ORDER`, `STAGE_INDEX`, `StewardshipRunReport` | ✅ |
| Orchestrator | `MemoryStewardshipOrchestrator` — sort, run, isolate errors, persist | ✅ |
| Run store | `InMemoryStewardshipRunStore` (cap 50 runs/owner) | ✅ |
| Tasks | MetadataAudit, Consolidation, EmbeddingAudit, RetrievalOptimization | ✅ |
| Composition | `create-memory-stewardship-ports.ts` | ✅ |
| Env | `MEMORY_STEWARDSHIP_ENABLED=false` in `src/config/env.ts` | ✅ |
| CLI | `steward:memories` / `steward:memories:execute` | ✅ |
| Manifest | `capabilities.supportsSelfManagement` | ✅ |
| Docs | DESIGN, README, ADR-045, 04-ARCHITECTURE | ✅ |

---

## File map

```
src/memory/stewardship/
  stewardship.types.ts
  imaintenance-task.interface.ts
  imemory-stewardship-orchestrator.interface.ts
  istewardship-run-store.interface.ts
  memory-stewardship-orchestrator.ts
  in-memory-stewardship-run-store.ts
  tasks/metadata-audit.task.ts
  tasks/consolidation.task.ts
  tasks/embedding-audit.task.ts
  tasks/retrieval-optimization.task.ts
  index.ts
src/composition/create-memory-stewardship-ports.ts
scripts/steward-memories.ts
tests/memory/stewardship/orchestrator.test.ts
tests/memory/stewardship/tasks.test.ts
```

---

## Wiring

```typescript
// create-memory-stewardship-ports.ts
createMemoryStewardshipPorts(sql, env) → {
  enabled: env.MEMORY_STEWARDSHIP_ENABLED,
  orchestrator: MemoryStewardshipOrchestrator([
    MetadataAuditTask,
    ConsolidationTask(consolidator),  // wraps MemoryConsolidator
    EmbeddingAuditTask,
    RetrievalOptimizationTask,
  ], { runStore }),
  runStore: InMemoryStewardshipRunStore,
}
```

Consolidator receives `RuleBasedCompressionPolicy` when `COMPRESSION_ENABLED=true`.

---

## Reserved stages (not yet registered)

| Stage | Future owner |
|-------|--------------|
| `graph-repair` | Phase 08.7 |
| `index-repair` | Phase 14 |
| `ranking-refresh` | Ranking adaptation phase |
| `duplicate-detection`, `archive` | Covered inside ConsolidationTask today |

---

## Non-regression

- `MemoryService` signatures unchanged
- Existing `consolidate:memories` CLI unchanged
- Stewardship inactive when `MEMORY_STEWARDSHIP_ENABLED=false` (default)
- All pre-existing tests green with flag off

---

## Rollback

1. Set `MEMORY_STEWARDSHIP_ENABLED=false` (default)
2. Git revert commit `94c7359` if full removal needed
3. No schema migration to reverse
