# Phase 38 F — Production enable readiness

**Date:** 2026-07-29  
**Status:** **Complete** — Owner re-opened F; see [PROD-F-2026-07-29.md](./PROD-F-2026-07-29.md)  
**Authority:** ARCH-0253 Hold lifted by Owner · production enable executed  

## Binding (post-F)

| Item | State |
|------|--------|
| E | Accepted on `ratary-staging` |
| F | **Complete** (fixture-first production enable) |
| Prod / Vercel `CODE_MEMORY_ENABLED` | **true** |
| First index | `fixture/phase38` only |

## Historical Hold checklist (all done)

1. [x] Owner explicit Accept of F  
2. [x] Prod D1 `ai-cloud` migrated  
3. [x] Vercel: `CODE_MEMORY_ENABLED=true` · `CODE_STORE_PROVIDER=sql`  
4. [x] Agreed repo set = fixture  
5. [x] Rollback plan known (flag off)  
6. [x] Hosted REST `traverse` smoke PASS  

## Rollback

```text
CODE_MEMORY_ENABLED=false
# optional: CODE_STORE_PROVIDER=none
```

Tables may remain; recall ignores Code Memory when flag off (I0).
