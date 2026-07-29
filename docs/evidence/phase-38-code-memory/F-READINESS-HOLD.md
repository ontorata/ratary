# Phase 38 F — Production enable readiness (Hold)

**Date:** 2026-07-29  
**Status:** **Hold** — readiness only; **do not enable** until Owner re-opens F  
**Authority:** ARCH-0253 Accept E + Hold · [OPS-PACK.md](./OPS-PACK.md)

## Binding

| Item | State |
|------|--------|
| E | Accepted on `ratary-staging` |
| F | **Hold** |
| Prod `CODE_MEMORY_ENABLED` | **false** |
| This doc | Checklist / runbook — not an Accept of F |

## Preconditions (when Owner re-opens F)

1. [ ] Owner explicit Accept of F (not implied by this file)
2. [ ] Prod D1 `ai-cloud` migrated (`npm run db:migrate` with **prod** env only after Accept)
3. [ ] Vercel / production env:
   - `CODE_MEMORY_ENABLED=true`
   - `CODE_STORE_PROVIDER=sql`
4. [ ] Agreed repo set for first index (start small; not full monorepo day-1)
5. [ ] Rollback plan rehearsed: set flag `false` (I0: unused on recall)
6. [ ] Monitor: index run status · table growth · MCP `traverse_code` smoke on **staging API or canary** first if available

## Explicitly out of scope while Hold

- Do **not** set production flag from laptop `.env`
- Do **not** `index:code:execute` against `ai-cloud`
- Do **not** claim Phase 38 production-ready

## Rollback

```text
CODE_MEMORY_ENABLED=false
# optional: CODE_STORE_PROVIDER=none
```

Tables may remain; recall ignores Code Memory when flag off (I0).
