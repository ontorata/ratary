# Phase 10 — Enterprise — TESTING

**Document:** TESTING  
**Phase status:** Complete  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Quality gate (2026-07-03)

```text
npm run lint      → PASS
npm run typecheck → PASS
npm test          → 402 passed (72 files)
```

Baseline at default env (`ENTERPRISE_RBAC=false`): **unchanged regression surface** vs pre-Phase-10 (310+ target exceeded).

---

## New test coverage

| Area | File | Tests |
|------|------|-------|
| D1 SQL adapter | `tests/infrastructure/d1-sql-database.adapter.test.ts` | 3 |
| Vector bridge | `tests/infrastructure/d1-vector-store.bridge.test.ts` | 3 |
| Platform factory | `tests/infrastructure/platform-adapters.defaults.test.ts` | 3 |
| Enterprise DDL | `tests/db/enterprise-migration.test.ts` | 4 |
| Org backfill | `tests/scripts/organization-backfill.test.ts` | 1 |
| RBAC E2E | `tests/api/cross-organization-leak.test.ts` | 12 |
| Memory access audit | `tests/infrastructure/memory-access-auditor.test.ts` | 4 |
| Context audit wiring | `tests/memory/context.service.test.ts` | +1 |

---

## Regression suites (unchanged at defaults)

| Suite | Tests | Result |
|-------|-------|--------|
| `cross-owner-leak.test.ts` | 23 | PASS |
| `cross-workspace-leak.test.ts` | 17 | PASS |
| `platform-ports.test.ts` | 10 | PASS |
| MCP tools | 4 | PASS |
| Context / graph E2E | — | PASS |

---

## RBAC test matrix (`ENTERPRISE_RBAC=true`)

| Scenario | Expected |
|----------|----------|
| Member + assigned workspace | 200 read / 201 write |
| No membership + workspace header | 403 |
| Viewer role | 200 read, 403 write/PATCH/DELETE |
| Admin role | 201 write |
| Cross-workspace scope on foreign memory | 404 |
| No `X-Workspace-Id` | RBAC skipped; default workspace path |

---

*Evidence captured at commit gate. Re-run `npm test` before production deploy.*
## Current regression

689 passed | 3 skipped (default env, 2026-07-04) (full suite, all master flags OFF)
