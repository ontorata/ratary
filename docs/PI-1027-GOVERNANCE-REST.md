# PI-1027 — Governance REST API

**Status:** PI-1027-A Live · PI-1027-B exception requests (2026-08-01)  
**ADR:** docs-ai `architecture/acos/ADR-1027-memory-governance-dashboard.md` · ADR-1029  
**Evidence:** docs-ai `products/ratary/evidence/PI-1027-A-MEMORY-GOVERNANCE-DASHBOARD-2026-08-01.md`

Tenant-scoped endpoints (`memory.read` for GET; create exception uses authenticated owner session):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/governance/manifest` | Shape G registry (`getMemoryGovernanceManifest()`) |
| GET | `/api/v1/governance/stewardship/runs?limit=` | Recent stewardship runs for authenticated owner |
| GET | `/api/v1/governance/stewardship/runs/:runId` | Single run detail |
| GET | `/api/v1/governance/exceptions?limit=` | Governance exception requests (PI-1027-B) |
| GET | `/api/v1/governance/exceptions/:exceptionId` | Exception detail |
| POST | `/api/v1/governance/exceptions` | Create exception **request** (status=`pending`; no auto-approve) |

**Code:** `src/controllers/governance.controller.ts` · `src/routes/v1/governance.routes.ts`

**Non-goals:** policy mutation · stewardship execute from REST · bypass tenancy · auto-approve exceptions.

Stewardship execute remains MCP `run_stewardship` (dry-run default).
