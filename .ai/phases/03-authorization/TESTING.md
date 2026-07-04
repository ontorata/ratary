# Phase 3 — Authorization — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-06-30  
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
| Phase gate (2026-06-30) | ~130 tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/auth/auth.service.test.ts` | API key validation, HMAC, owner binding |
| `tests/api/auth.test.ts` | 401/403 on missing or invalid credentials |
| `tests/api.test.ts` | Protected routes require auth |

---

## Scenarios verified

- [x] Invalid API key → 401 on protected routes
- [x] Valid `aic_...` key resolves to stable ownerId
- [x] MCP stdio uses env-scoped owner without REST key header
- [x] No cross-owner access without correct credentials

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
