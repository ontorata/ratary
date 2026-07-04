# ADR-045: Self-Managing Memory Stewardship (Phase 04.7)

**Status:** Accepted (Implemented 2026-07-04)  
**Date:** 2026-07-04  
**Deciders:** Project owner (implementation authorized 2026-07-04)  

---

## Context

Consolidator and embed jobs exist but are manual. Stakeholders require self-managing memory hygiene without planner/agent.

Design: [.ai/phases/04.7-memory-stewardship/DESIGN.md](../../.ai/phases/04.7-memory-stewardship/DESIGN.md)

## Decision

Adopt `IMemoryStewardshipOrchestrator` with fixed-order maintenance tasks (async, dry-run default). `MEMORY_STEWARDSHIP_ENABLED=false` default.

## Implementation

- **Ports** (`src/memory/stewardship/`): `IMaintenanceTask`, `IMemoryStewardshipOrchestrator`, `IStewardshipRunStore`.
- **Orchestrator** `MemoryStewardshipOrchestrator`: sorts tasks by `STEWARDSHIP_STAGE_ORDER`, runs them in that fixed order, isolates per-task failures, aggregates a `StewardshipRunReport`, persists it to the run store. Dry-run is the default.
- **Tasks**: `MetadataAuditTask`, `ConsolidationTask` (wraps `MemoryConsolidator`), `EmbeddingAuditTask`, `RetrievalOptimizationTask`. Graph/index repair stages are reserved for future phases behind the same contract.
- **Run store**: `InMemoryStewardshipRunStore` (default, swappable).
- **Composition**: `src/composition/create-memory-stewardship-ports.ts`, gated by `MEMORY_STEWARDSHIP_ENABLED`.
- **CLI**: `steward:memories` / `steward:memories:execute`.
- **Manifest**: `capabilities.supportsSelfManagement` reflects the flag.
- **Constitutional invariant**: `MemoryService` and repositories untouched; stewardship composes existing capabilities from the outside.
- **Tests**: `tests/memory/stewardship/orchestrator.test.ts`, `tests/memory/stewardship/tasks.test.ts`.

## Rollback

Disable flag; existing CLI scripts unchanged. Stewardship code is additive and composes existing services, so removal has no runtime impact when the flag is off.
