# Phase 18 — Cloud Platform — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-033 Implemented](../../adr/033-cloud-platform.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 18A | `IControlPlane` + `ControlPlaneService` (manual adapter) | ✅ |
| 18B | `IRegionRegistry` + `ITenantMetadataStore` SQL adapters | ✅ |
| 18C | `IUsageMeter` + in-memory/SQL + Phase 12 event consumer | ✅ |
| 18D | `IDisasterRecovery` + local backup wrapper | ✅ |
| 18E | `ICloudProvisioner` + manual/noop adapters | ✅ |
| 18F | Admin REST `/cloud/*` (additive) | ✅ |
| 18G | Federation region topology in `getTenantTopology` | ✅ |
| 18H | Capability manifest `cloud` section | ✅ |

---

## File map

```
src/cloud/
  types/           region, tenant, usage, DR types
  ports/           IControlPlane, IUsageMeter, IDisasterRecovery, …
  adapters/        noop, manual provisioner, local DR, in-memory usage
  services/        ControlPlaneService
  consumers/       UsageMeterEventConsumer (Phase 12 subscriber)
src/infrastructure/cloud/
  sql-region-registry.ts
  sql-tenant-metadata-store.ts
  sql-usage-meter.ts
src/composition/create-cloud-ports.ts
src/controllers/cloud.controller.ts
src/routes/v1/cloud.routes.ts
src/db/migrations.ts   migrateCloudPlatformPhase1
tests/cloud/
tests/api/cloud.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `CONTROL_PLANE_ENABLED` | `false` | Master gate — routes + orchestration |
| `USAGE_METER_ENABLED` | `false` | Event-driven usage aggregation |
| `DR_PLATFORM_ENABLED` | `false` | DR schedule/restore/failover |
| `CLOUD_DEFAULT_REGION` | `local` | Default region code for new tenants |
| `CLOUD_PROVISIONER` | `manual` | External infra hook (`none` = noop) |
| `USAGE_METER_STORE` | `memory` | `sql` for persistent usage records |

---

## REST endpoints (when `CONTROL_PLANE_ENABLED=true`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/cloud/status` | Layer status |
| GET | `/api/v1/cloud/regions` | List regions |
| POST | `/api/v1/cloud/workspaces/provision` | Provision tenant metadata |
| POST | `/api/v1/cloud/workspaces/deprovision` | Soft-deprovision |
| POST | `/api/v1/cloud/workspaces/:id/region` | Assign primary/secondary |
| GET | `/api/v1/cloud/workspaces/:id/topology` | Topology + federation peers |
| POST | `/api/v1/cloud/identities/:id/rotate-key` | API key rotation hook |
| GET | `/api/v1/cloud/usage/export` | Billing export (requires `USAGE_METER_ENABLED`) |
| GET | `/api/v1/cloud/usage/aggregate` | Usage aggregates |
| POST | `/api/v1/cloud/dr/schedule` | Schedule backup (requires `DR_PLATFORM_ENABLED`) |
| GET | `/api/v1/cloud/dr/schedules` | List DR schedules |
| POST | `/api/v1/cloud/dr/schedules/:id/run` | Run backup snapshot |
| POST | `/api/v1/cloud/dr/verify` | Integrity check |
| POST | `/api/v1/cloud/dr/failover` | Promote secondary region |

---

## Control plane vs data plane

```
Admin request → Auth → IControlPlane (metadata only)
Memory CRUD   → Auth → Handlers → MemoryService (unchanged)
Phase 12 bus  → UsageMeterEventConsumer → IUsageMeter (async, optional)
DR run        → IDisasterRecovery → MemoryService.exportBackup (public API)
```

---

## Invariants

- `MemoryService` source unchanged
- All flags OFF → identical to pre-Phase-18 behavior
- Control plane never calls repository layer directly

---

## Deferred

- gRPC admin surface (Phase 13 extension)
- External K8s/Terraform adapter implementations (docs-only guide)
- Redis-backed usage aggregation
- Full restore write-path (restore returns count; import via existing backup API)
