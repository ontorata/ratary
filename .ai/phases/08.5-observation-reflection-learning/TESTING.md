# Phase 8.5 — Quality Signals — TESTING

**Document:** TESTING  
**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Gate (2026-07-04) | Platform snapshot |
|--------|-------------------|-------------------|
| Total tests | 689 passed \| 3 skipped | **736 passed** \| 3 skipped |
| Phase 8.5 new tests | signal-ingest + policy + migration | unchanged contract |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/ingest/importance-scoring-policy.test.ts` | Bounded deltas, clamp 0–100 |
| `tests/ingest/signal-ingest.test.ts` | Ingest, idempotency, scope isolation, consolidation_hint |
| `tests/composition/signal-ingest-ports.test.ts` | Composition root wiring, env gating |
| `tests/db/extension-tracks-migration.test.ts` | `memory_signals` table + index |
| `tests/capabilities/manifest-builder.test.ts` | `supportsQualitySignals` flag |

---

## Scenarios verified

- [x] Explicit feedback applies bounded importance delta (+5 helpful / −3 not_helpful)
- [x] Duplicate `signalId` returns `duplicate: true` without double-apply
- [x] Cross-owner memory rejected (scope isolation)
- [x] `consolidation_hint` accepted with `appliedDelta: 0`
- [x] `SIGNAL_INGEST_ENABLED=false` → ports disabled, no REST route registration
- [x] SQL signal store wired when `SIGNAL_STORE_PROVIDER=sql`
- [x] Migration creates `memory_signals` append-only table
- [x] Manifest `supportsQualitySignals` mirrors env flag
- [x] No agent planner / reflection LLM code in `src/services`

---

## Manual verification

```bash
# With SIGNAL_INGEST_ENABLED=true
curl -X POST http://localhost:3000/api/v1/signals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"signalId":"test-1","signalType":"explicit_feedback","memoryId":"<id>","payload":{"value":"helpful"}}'

npm run reflect:signals
# Expect: dry-run advisory message; no weight mutation when RANKING_ADAPTATION_ENABLED=false
```

---

## Deferred tests (CHECKLIST D85-04 / D85-05)

| ID | Test | Status | Mitigation |
|----|------|--------|------------|
| D85-04 | `ranker.test.ts` — importance delta affects sort order | ⏳ Open | `importance-scoring-policy.test.ts` + manual search/context verify |
| D85-05 | REST E2E `POST /api/v1/signals` with auth fixture | ⏳ Open | `signal-ingest-ports.test.ts` + staging with flag ON |

---

## Current regression

736 passed | 3 skipped (default env, 2026-07-05) (full suite, all master flags OFF)

---

## Post-gate note

Phase **8.6** learning event store receives signals via `LearningEventRecorder` when both ingest and learning flags are ON — tested in Phase 8.6 suite, not duplicated here.

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
