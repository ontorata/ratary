# Phase 04.7 — Self-Managing Memory Stewardship

**Status:** ✅ Implemented (2026-07-04) · ADR-045 Accepted  
**Capability:** Deterministic maintenance pipeline — duplicates, merge, compress, archive, graph/index repair, ranking refresh, audits. **No planner. No agent. No LLM on hot path.**

**Flags:** `MEMORY_STEWARDSHIP_ENABLED=false` (default) · optional SQL run store · optional local scheduler

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ Complete |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04; follow-up tasks closed same release train.*

---

## What it does

Runs **seven** maintenance tasks in fixed stage order behind `IMaintenanceTask`, `IMemoryStewardshipOrchestrator`, and `IStewardshipRunStore`. Composes `MemoryConsolidator`, Phase 8.7 graph inference, Phase 21 index sync, Phase 8.6 ranking refresh, and read-only audits. Dry-run by default; every run recorded (in-memory or SQL).

- Code: `src/memory/stewardship/**`, `src/composition/create-memory-stewardship-ports.ts`
- CLI: `npm run steward:memories` / `steward:memories:execute`
- MCP: `run_stewardship` (dry-run default)

---

## Pipeline stages

| Stage | Task | Requires |
|-------|------|----------|
| metadata-repair | `MetadataAuditTask` | — |
| merge-compress / archive | `ConsolidationTask` | — |
| graph-repair | `GraphRepairTask` | `RELATION_INFERENCE_ENABLED` |
| embedding-repair | `EmbeddingAuditTask` | — |
| index-repair | `IndexRepairTask` | `SEARCH_GRAPH_PLATFORM_ENABLED` |
| ranking-refresh | `RankingRefreshTask` | `LEARNING_ENGINE_ENABLED` + SQL store |
| retrieval-optimization | `RetrievalOptimizationTask` | — |

Skipped tasks report `status: skipped` — pipeline continues.

---

## Quick start

```bash
npm run steward:memories              # dry-run
npm run steward:memories:execute      # mutate
npm run steward:memories -- --project=my-project
```

```env
MEMORY_STEWARDSHIP_ENABLED=true
MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER=sql   # optional persistent audit trail
MEMORY_STEWARDSHIP_SCHEDULER=local        # optional in-process scheduler
RELATION_INFERENCE_ENABLED=true           # graph-repair stage
SEARCH_GRAPH_PLATFORM_ENABLED=true        # index-repair stage
LEARNING_ENGINE_ENABLED=true              # ranking-refresh stage
LEARNING_STORE_PROVIDER=sql
```

**External cron:** point scheduler at `npm run steward:memories:execute` (Vercel Cron, K8s CronJob).

Manifest: `capabilities.supportsSelfManagement: true` when master flag ON.

---

## Guarantees

- `MemoryService` / repositories unchanged.
- Per-task error isolation; dry-run default.
- No LLM on CRUD hot path.
