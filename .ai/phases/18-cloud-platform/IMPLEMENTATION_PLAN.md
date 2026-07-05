# Phase 18 — IMPLEMENTATION_PLAN

**Principle:** One concern per commit. MemoryService `src/services/` **unchanged**. All work in ports, adapters, admin routes, composition root.

| # | Commit | Scope |
|---|--------|-------|
| 1 | `docs(adr): approve ADR-033` | ADR status → Approved |
| 2 | `feat(cloud): IControlPlane port + manual adapter` | `src/ports/cloud/control-plane.ts` |
| 3 | `feat(cloud): IRegionRegistry + ITenantMetadataStore` | Ports + SQL adapters (additive schema migration) |
| 4 | `feat(cloud): IUsageMeter port + noop adapter` | `src/ports/cloud/usage-meter.ts` |
| 5 | `feat(cloud): wire IUsageMeter to Phase 12 bus subscriber` | Async consumer; flag-gated |
| 6 | `feat(cloud): IDisasterRecovery port + local wrapper` | Wraps existing backup port |
| 7 | `feat(cloud): ICloudProvisioner port + noop adapter` | External hook surface |
| 8 | `feat(cloud): admin REST routes (additive)` | Workspace/region/DR admin; Phase 17 auth |
| 9 | `feat(cloud): admin gRPC surface (additive)` | If Phase 13 gRPC admin extension exists |
| 10 | `feat(cloud): federation region assignment hooks` | Phase 14 integration |
| 11 | `chore(env): CONTROL_PLANE_* feature flags` | `.env.example`, composition root |
| 12 | `docs(cloud): external K8s/TF adapter guide` | Docs only — no IaC in repo |
| 13 | `test(cloud): port unit + admin integration tests` | Per TESTING_PLAN |
| 14 | `docs(phase): gate evidence` | TESTING, COMPLETION |

## Composition root wiring

```
CONTROL_PLANE_ENABLED=true  → IControlPlane (manual)
USAGE_METER_ENABLED=true    → IUsageMeter (sql/redis aggregate)
DR_PLATFORM_ENABLED=true    → IDisasterRecovery (local wrapper)
(default)                   → all noop/manual — identical to pre-18
```

## Files expected (illustrative — no code in design phase)

| Area | Path pattern |
|------|--------------|
| Ports | `src/ports/cloud/*.ts` |
| Adapters | `src/adapters/cloud/*.ts` |
| Admin routes | `src/routes/admin/cloud*.ts` |
| Wiring | `src/composition/cloud.ts` |
| Tests | `tests/cloud/*.test.ts` |

## Blockers

- Phase 17 auth/policy must be available for admin route gating
- Phase 14 federation peer registry for multi-region assignment
- ADR-033 Approved before commit 2
