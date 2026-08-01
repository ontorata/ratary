# PI-1027-A — Governance read REST API

**Status:** Product MVP (Studio Memory Governance dashboard)  
**ADR:** docs-ai `architecture/acos/ADR-1027-memory-governance-dashboard.md`  
**Evidence:** docs-ai `products/ratary/evidence/PI-1027-A-MEMORY-GOVERNANCE-DASHBOARD-2026-08-01.md`

Read-only endpoints (tenant-scoped, `memory.read`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/governance/manifest` | Shape G registry (`getMemoryGovernanceManifest()`) |
| GET | `/api/v1/governance/stewardship/runs?limit=` | Recent stewardship runs for authenticated owner |
| GET | `/api/v1/governance/stewardship/runs/:runId` | Single run detail |

**Code:** `src/controllers/governance.controller.ts` · `src/routes/v1/governance.routes.ts`

**Non-goals:** policy mutation · stewardship execute from REST · bypass tenancy.

Stewardship execute remains MCP `run_stewardship` (dry-run default).
