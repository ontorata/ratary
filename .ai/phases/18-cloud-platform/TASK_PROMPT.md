# Phase 18 — TASK_PROMPT

**Blocked until ADR-033 Approved.**

Implement Cloud Platform as **control plane ports + adapters** — orchestrate tenant/workspace lifecycle, multi-region topology, usage metering (Phase 12 consumer), and DR backup/restore. **MemoryService and data plane business logic unchanged.**

## Deliverables

1. **`IControlPlane`** — workspace provisioning, API key lifecycle, region assignment
2. **`IUsageMeter`** — Phase 12 event subscriber; billing export adapter
3. **`IDisasterRecovery`** — backup/restore orchestration wrapping existing backup port
4. **`IRegionRegistry`**, **`ITenantMetadataStore`**, **`ICloudProvisioner`** — supporting ports
5. Admin API routes (REST/gRPC additive) — gated by Phase 17 auth/policy
6. Feature flags default OFF: `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED`
7. Reference adapters: manual config (default), noop meter, local DR wrapper; external K8s/TF consumer docs only

## Constraints

- Clean Architecture: ports in `src/ports/cloud/`, adapters at composition root
- No cloud vendor IaC in repo
- No MemoryService changes
- No breaking REST v1 / MCP schemas
- Agent runtime remains external

## Read first

- [DESIGN.md](DESIGN.md)
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
- [ADR-033](../../adr/033-cloud-platform.md)

## Gate

All [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS · [CHECKLIST.md](CHECKLIST.md) complete · `npm test` green with flags OFF.
