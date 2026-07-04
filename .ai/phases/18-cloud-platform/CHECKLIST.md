# Phase 18 — CHECKLIST

## ADR & design

- [ ] ADR-033 Approved
- [ ] DESIGN reviewed — control/data plane boundary clear
- [ ] MemoryService unchanged confirmed in code review

## Ports & adapters

- [ ] `IControlPlane` port + manual config adapter (default)
- [ ] `IUsageMeter` port + noop adapter (default)
- [ ] `IDisasterRecovery` port + local backup wrapper (default)
- [ ] `IRegionRegistry` port + SQL/in-memory adapter
- [ ] `ITenantMetadataStore` port + SQL adapter
- [ ] `ICloudProvisioner` port + noop adapter (default)

## Integration

- [ ] Phase 14 federation hooks for multi-region peer assignment
- [ ] Phase 17 auth/policy on all admin routes
- [ ] Phase 12 event bus subscriber for usage metering (async, opt-in)
- [ ] Existing backup port wrapped by DR orchestration

## Feature flags

- [ ] `CONTROL_PLANE_ENABLED=false` default — pre-Phase-18 behavior
- [ ] `USAGE_METER_ENABLED=false` default
- [ ] `DR_PLATFORM_ENABLED=false` default

## API & compatibility

- [ ] Admin routes additive only — REST v1 memory routes unchanged
- [ ] gRPC admin surface additive (if applicable)
- [ ] Tenant isolation via resolved `MemoryScope` — no cross-tenant bypass

## Documentation & gate

- [ ] External K8s/TF consumer adapter documented (not in repo)
- [ ] `.env.example` updated with new flags
- [ ] [TESTING_PLAN.md](TESTING_PLAN.md) executed
- [ ] [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS
