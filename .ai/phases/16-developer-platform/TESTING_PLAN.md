# Phase 16 — TESTING_PLAN

| Suite | Scope |
|-------|-------|
| SDK contract | Generated client vs OpenAPI schema |
| SDK integration | Live server: CRUD round-trip |
| CLI e2e | `ai-brain memory list` via SDK |
| MCP server e2e | Remote MCP tool → SDK → server |
| No-logic lint | grep SDK for `MemoryService`, SQL, ranking |
| Server regression | Full `npm test` unchanged |

Per-language SDK: smoke test in CI matrix (optional nightly).
