# Phase 04.7 — Self-Managing Memory Stewardship — DESIGN

**Status:** Implemented (2026-07-04) · ADR-045 Accepted  
**ADR gate:** [ADR-045](../../../docs/adr/045-self-managing-memory-stewardship.md) · **Extends:** MemoryConsolidator (Phase 4), 05.5, 06.5, 08.5, 08.7, 09.6  
**Flag:** `MEMORY_STEWARDSHIP_ENABLED=false`

## Purpose

Orchestrate async maintenance tasks in a **fixed, deterministic order** — no planner, no autonomous agent, no LLM merge. The pipeline composes existing capabilities (consolidation, compression, backfills) and read-only health audits, records each run, and honors dry-run by default.

## Fixed stage order

`STEWARDSHIP_STAGE_ORDER` (`src/memory/stewardship/stewardship.types.ts`):

1. `metadata-repair`
2. `duplicate-detection`
3. `merge-compress`
4. `archive`
5. `graph-repair`
6. `embedding-repair`
7. `index-repair`
8. `ranking-refresh`
9. `retrieval-optimization`

The orchestrator sorts registered tasks by this order, so registration order is irrelevant and execution is reproducible.

## Ports

| Port | File | Role |
|------|------|------|
| `IMaintenanceTask` | `imaintenance-task.interface.ts` | One deterministic, idempotent step; must not mutate in dry-run |
| `IMemoryStewardshipOrchestrator` | `imemory-stewardship-orchestrator.interface.ts` | Runs tasks in fixed order, isolates failures, aggregates a run report |
| `IStewardshipRunStore` | `istewardship-run-store.interface.ts` | Audit trail of runs (default: `InMemoryStewardshipRunStore`) |

## Tasks (default composition)

| Task | Stage | Behavior |
|------|-------|----------|
| `MetadataAuditTask` | `metadata-repair` | Read-only: counts missing codename / slug / semantic hash |
| `ConsolidationTask` | `merge-compress` | Wraps `MemoryConsolidator` — dedup, merge, compress/summarize, archive, stale promotion (respects dry-run) |
| `EmbeddingAuditTask` | `embedding-repair` | Read-only: counts active memories without an embedding id |
| `RetrievalOptimizationTask` | `retrieval-optimization` | Read-only: level distribution + active/archived split, tagged with ranking policy version |

Graph/index repair stages are intentionally left unregistered; future phases (08.7 graph, 14 index) plug tasks in behind the same contract with zero orchestrator change.

## Composition & invocation

- Composition root: `src/composition/create-memory-stewardship-ports.ts` → `{ enabled, orchestrator, runStore }`.
- Gated by `MEMORY_STEWARDSHIP_ENABLED`; callers decide whether to invoke.
- Manual CLI: `npm run steward:memories` (dry-run) / `npm run steward:memories:execute`.
- Manifest: `capabilities.supportsSelfManagement` reflects the flag.

## Non-goals

Planner, autonomous agent, LLM merge, `MemoryService` rewrite, new persistence schema.

## MemoryService impact

None. Services, repositories, and storage ports are untouched; stewardship composes them from the outside.

## Testing

- `tests/memory/stewardship/orchestrator.test.ts` — fixed-order execution, dry-run default, failure isolation, run-store persistence.
- `tests/memory/stewardship/tasks.test.ts` — real tasks over the SQL test harness: duplicate detection (dry-run) and archive-on-execute; composition flag wiring.
