# Phase 6.5 — Progressive Retrieval — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/memory/default-retrieval-policy.test.ts` | Summary-only default, body hydration, vector/graph stages, tight budget, policy version |
| `tests/memory/context.service.test.ts` | `retrievalPlan` in buildContext result |
| `tests/composition/progressive-retrieval-ports.test.ts` | Composition wiring from env flags |
| `tests/memory/token-benchmark.test.ts` | ≥85% summary savings vs naive dump (CI-stable) |
| `tests/capabilities/manifest-builder.test.ts` | `supportsProgressiveRetrieval`, policy version |

---

## Scenarios verified

- [x] Default policy: metadata + summary stages, no body hydration
- [x] Body hydration when `includeSummaryOnly=false`
- [x] Vector/graph stages when deployment flags enabled
- [x] Adaptive `maxMemories` reduction under tight char budget
- [x] Custom policy version from env via composition root
- [x] ContextService returns `retrievalPlan` with policy version and stages

---

## Manual verification

```bash
# MCP get_context — default summary-only
# REST POST /api/v1/context — check retrievalPlan in response

# Full body hydration
# MCP: content_mode=full or include_body=true
```

---

## Optional evidence

```bash
npm run benchmark:context-tokens
```

Documents token savings for summary-first vs full body path. **Recorded 2026-07-04:** default policy summary path **85.5%** vs naive dump — see [COMPLETION.md](COMPLETION.md#token-benchmark-evidence-optional--sc-65-06).
## Current regression

689 passed | 3 skipped (default env, 2026-07-04) (full suite, all master flags OFF)
