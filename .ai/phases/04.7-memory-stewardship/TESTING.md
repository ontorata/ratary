# Phase 04.7 — Self-Managing Memory Stewardship — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Quality gate:** typecheck ✅ · lint ✅ · format ✅ · **710 tests passed** | 3 skipped

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/memory/stewardship/orchestrator.test.ts` | Stage order, dry-run default, error isolation, run-store persistence |
| `tests/memory/stewardship/tasks.test.ts` | Full 7-stage pipeline integration (SQL harness) |
| `tests/memory/stewardship/graph-repair.task.test.ts` | Graph inference delegation + skip |
| `tests/memory/stewardship/index-repair.task.test.ts` | Search/graph sync + per-target errors |
| `tests/memory/stewardship/ranking-refresh.task.test.ts` | Learning orchestrator delegation |
| `tests/infrastructure/stewardship/sql-stewardship-run-store.test.ts` | SQL run history persist/list |
| `tests/jobs/local-stewardship-scheduler.test.ts` | Scheduler enqueue → orchestrator |
| `tests/mcp/tools.test.ts` | `run_stewardship` dry-run + tool registry (21 tools) |
| `tests/capabilities/manifest-contract.test.ts` | `supportsSelfManagement: false` when flag off |

---

## Scenarios verified

### Orchestrator

- [x] Tasks run in `STEWARDSHIP_STAGE_ORDER` regardless of registration order
- [x] `dryRun` defaults to `true`
- [x] Failing task isolated; pipeline completes
- [x] Run persisted to in-memory or SQL store

### Tasks (SQL harness)

- [x] Consolidation duplicate detect + archive on execute
- [x] `GraphRepairTask`, `IndexRepairTask`, `RankingRefreshTask` → `skipped` when flags OFF
- [x] Full stage list: metadata → merge → graph → embedding → index → ranking → retrieval

### MCP

- [x] `run_stewardship` returns `StewardshipRunReport` with `dryRun: true`

---

## Manual verification

```bash
npm run steward:memories
npm run steward:memories:execute
npm run steward:memories -- --project=my-project
```

MCP: call `run_stewardship` with `{ "dry_run": true }`.

---

## Current regression

**710 passed** | 3 skipped (default env, all master flags OFF)
