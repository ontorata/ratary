# Phase 04.7 — Self-Managing Memory Stewardship — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Quality gate:** typecheck ✅ · lint ✅ · format ✅ · **493 tests passed** (7 new)

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/memory/stewardship/orchestrator.test.ts` | Fixed stage order regardless of registration order; dry-run default; per-task error isolation; run-store persistence |
| `tests/memory/stewardship/tasks.test.ts` | Real tasks via SQL harness: duplicate detection (dry-run), archive-on-execute, composition flag wiring |
| `tests/capabilities/manifest-contract.test.ts` | `supportsSelfManagement: false` when flag off |

---

## Scenarios verified

### Orchestrator

- [x] Tasks run in `STEWARDSHIP_STAGE_ORDER` even when registered out of order
- [x] `dryRun` defaults to `true` and propagates to task context
- [x] Failing task gets `status: 'error'`; remaining tasks still complete
- [x] `StewardshipRunReport` aggregates `totalScanned`, `totalChanged`, `hadErrors`
- [x] Run persisted to `InMemoryStewardshipRunStore`

### Tasks (SQL harness)

- [x] `MetadataAuditTask` scans owner memories
- [x] `ConsolidationTask` detects duplicates in dry-run (`totalChanged: 0`)
- [x] `ConsolidationTask` archives duplicates on `--execute` (`changed > 0`)
- [x] `EmbeddingAuditTask` reports memories without embedding
- [x] `RetrievalOptimizationTask` reports level distribution + policy version
- [x] `createMemoryStewardshipPorts` returns `enabled: false` by default

---

## Manual verification

```bash
# Dry-run (default — no mutations)
npm run steward:memories

# Execute (mutates — archives duplicates, etc.)
npm run steward:memories:execute

# Optional project filter
npm run steward:memories -- --project=my-project
```

---

## Non-regression

- All 486+ pre-existing tests pass with `MEMORY_STEWARDSHIP_ENABLED=false`
- `MemoryService` contract tests unchanged
- Consolidator tests unchanged

---

## Future test additions

- [ ] Graph repair task when Phase 08.7 registers
- [ ] Index repair task when Phase 14 registers
- [ ] SQL-backed `IStewardshipRunStore` adapter
- [ ] Optional scheduled stewardship job integration test
