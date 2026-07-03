# Phase 9 — Multi-AI — COMPLETED

**Status:** ✅ COMPLETED  
**Date:** 2026-07-03  
**ADR:** [ADR-007 Multi-AI Workspace Scope](../../../docs/adr/007-multi-ai-workspace-scope.md)

---

## Summary

Multiple AI clients share workspace-scoped memory under one owner. `IScopeResolver` resolves effective scope at REST/MCP boundary; repositories enforce `owner_id` + optional `workspace_id`; additive workspace/agent registry API.

---

## Success criteria → evidence

| Criterion | Evidence |
|-----------|----------|
| Multiple AI clients share workspace-scoped memory | `DefaultScopeResolver`, MCP env, `X-Workspace-Id`; workspace/agent REST + MCP |
| `MemoryService` core not rewritten | Extended via scope param + repository filters only |
| Owner isolation preserved | `tests/api/cross-owner-leak.test.ts` (23) |
| Workspace isolation enforced | `tests/api/cross-workspace-leak.test.ts` (17) |
| Agent registry | `D1AgentIdentity`, workspace agent REST/MCP |
| Quality gate | 298 tests green |

---

## Deliverables

### Schema & ops

- Tables: `workspaces`, `agents`; columns: `memories.workspace_id`, `last_modified_by_agent_id`
- `npm run db:backfill-workspaces`

### REST (additive)

- `GET/POST /api/v1/workspaces`
- `GET/POST /api/v1/workspaces/:id/agents`
- Headers: `X-Workspace-Id`, `X-Agent-Id`

### MCP (additive)

- `list_workspaces`, `list_agents`, `register_agent`
- Env: `MCP_WORKSPACE_ID`, `MCP_AGENT_ID`

---

## Deferred / accepted debt

| Item | Path |
|------|------|
| Sync hook on memory writes | `AcceptSyncManager` at composition root |
| Agent column on writes | `last_modified_by_agent_id` migration only |
| Organization RBAC | Phase 10 |

---

## Next phase

**Phase 10 — Enterprise** per [09-ROADMAP.md](../../roadmap/09-ROADMAP.md).
