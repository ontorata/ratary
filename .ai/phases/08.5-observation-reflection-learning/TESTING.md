# Phase 8.5 — Quality Signals — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

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

## Deferred tests

- [ ] REST E2E `POST /api/v1/signals` with auth fixture (route gated at boot)
- [ ] `ranker.test.ts` extend — importance delta affects sort order deterministically
- [ ] `cross-owner-leak.test.ts` extend — signal ingest path
## Current regression

689 passed | 3 skipped (default env, 2026-07-04) (full suite, all master flags OFF)
