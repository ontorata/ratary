# Phase 25 — Global AI Intelligence — TESTING

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
| Phase gate (2026-07-04) | 682 (+9 phase tests) tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/global-intelligence/global-intelligence-ports.test.ts` | Noop when flag off |
| `tests/global-intelligence/manifest-builder.test.ts` | Capstone manifest |
| `tests/global-intelligence/usage-analytics.service.test.ts` | Adoption KPI from fixtures |
| `tests/global-intelligence/migration.test.ts` | Telemetry/sync/journal DDL |
| `tests/api/global-intelligence.test.ts` | REST `/intelligence/*` |

---

## Scenarios verified

- [x] Analytics read-only — never writes memories
- [x] Redactor default off content sampling
- [x] Telemetry consumer on Phase 12 domain events when both enabled
- [x] Sync orchestrator delegates to Phase 14 when federation on

## Manual verification

```bash
$env:GLOBAL_INTELLIGENCE_PLATFORM_ENABLED='true'; GET /api/v1/intelligence/status; POST /intelligence/sync with dryRun
```

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
