# Phase 9 — Multi-AI — TESTING

**Status:** ✅ Evidence attached (2026-07-03)

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```


**Current regression:** 689 passed | 3 skipped (default env, 2026-07-04)

---

## Test coverage

| Area | Tests |
|------|-------|
| Types + ports | `tests/scope/memory-scope.test.ts`, `tests/scope/scope-ports.test.ts` |
| Migration + backfill | `tests/db/multi-ai-migration.test.ts`, `tests/scripts/workspace-backfill.test.ts` |
| Scope resolver | `tests/scope/default-scope-resolver.test.ts`, `tests/scope/resolve-request-scope.test.ts` |
| Agent identity | `tests/agent/d1-agent-identity.test.ts` |
| Sync manager | `tests/sync/accept-sync-manager.test.ts` |
| Repository isolation | `tests/repositories/memory.repository.test.ts` (workspace filter) |
| Cross-owner E2E | `tests/api/cross-owner-leak.test.ts` (23) — regression |
| Cross-workspace E2E | `tests/api/cross-workspace-leak.test.ts` (17) |
| Workspace/agent API | `tests/api/workspaces.test.ts` (5) |
| Workspace store | `tests/scope/workspace-store.test.ts` (3) |
| Sync + attribution | `tests/services/memory-write-attribution.test.ts` (2) |
| MCP tools | `tests/mcp/tools.test.ts` (19 tools incl. Phase 9) |

---

## Manual verification (production)

1. `npm run db:migrate`
2. `npm run db:backfill-workspaces`
3. Bootstrap REST → create memory → verify `workspace_id` set
4. MCP with `MCP_OWNER_ID` + optional `MCP_WORKSPACE_ID` → `list_workspaces`, `save_memory`

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
