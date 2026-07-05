# Phase 21 — Search & Graph Production — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record verification strategy and evidence: unit, integration, E2E, fixtures, quality gate.

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Value |
|--------|-------|
| Phase gate (2026-07-04) | 630+ tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/search-graph-platform/orchestrator.test.ts` | Sync orchestration |
| `tests/search-graph-platform/search-graph-ports.test.ts` | Composition gate |
| `tests/db/search-graph-platform-migration.test.ts` | Watermark DDL |
| `tests/api/search-graph.test.ts` | Admin sync REST |

---

## Scenarios verified

- [x] D1 graph + SQL search remain defaults when platform off
- [x] Meilisearch/Neo4j sync reads SSOT only
- [x] Watermark state per target

## Deferred tests

- [ ] Staging Meilisearch+Neo4j cutover evidence archived
- [ ] Background incremental scheduler

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
