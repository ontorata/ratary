# Phase 18 — MIGRATION_PLAN

## Compatibility matrix

| Deployment | Before Phase 18 | After Phase 18 (flags OFF) | After Phase 18 (flags ON) |
|------------|-----------------|---------------------------|---------------------------|
| Single-node dev | Works | **Identical** | + admin API, optional metering |
| Multi-node federation | Phase 14 sync | **Identical** | Region-aware topology |
| Existing API keys | Phase 10 store | **Unchanged** | Rotation via control plane API |
| REST v1 memory | Frozen contract | **Unchanged** | Unchanged |
| MCP tools | Frozen schema | **Unchanged** | Unchanged |

## Rollout phases

### R1 — Dark launch (internal)

- Deploy ports + noop adapters
- All flags OFF in production
- Run integration tests in staging with `CONTROL_PLANE_ENABLED=true`

### R2 — Control plane beta

- Enable `CONTROL_PLANE_ENABLED` for pilot tenants
- Manual config adapter only
- Monitor admin audit logs (Phase 17)

### R3 — Usage metering beta

- Enable `USAGE_METER_ENABLED` for pilot tenants
- Validate export format with billing team
- Confirm zero hot-path latency regression (async subscriber)

### R4 — DR platform GA

- Enable `DR_PLATFORM_ENABLED` for tenants requiring SLA
- Document runbooks; external K8s/TF adapters optional
- Failover drill in staging multi-region topology

## Data migration

| Step | Action | Reversible |
|------|--------|------------|
| DM1 | Additive tables: `tenant_metadata`, `region_registry`, `usage_aggregates` | Yes — tables ignored when disabled |
| DM2 | Backfill: one `tenant_metadata` row per existing org | Yes |
| DM3 | Backfill: default region `local` for all workspaces | Yes |
| DM4 | No MemoryService table changes | N/A |

## Tenant isolation migration

- Existing `MemoryScope` resolution path preserved
- Control plane adds **metadata layer** only — does not widen scope
- Cross-tenant admin operations require service identity + Phase 17 policy

## Rollback procedure

1. Set `CONTROL_PLANE_ENABLED=false`, `USAGE_METER_ENABLED=false`, `DR_PLATFORM_ENABLED=false`
2. Restart nodes — composition root selects noop adapters
3. Admin routes return 404 or disabled response
4. Data plane serves memory API exactly as pre-Phase-18
5. Optional: drop additive tables in maintenance window (not required for rollback)

## Downstream impact

| Phase | Impact |
|-------|--------|
| 19 Observability | Control plane audit events → new dashboard panels |
| 20 AI Infrastructure | Control plane governs tenant plugin allow-list |
| 16 SDK | Optional admin client methods (additive semver minor) |

## No migration required for

- Agent runtime (external)
- Client SDK memory CRUD flows
- Federation protocol wire format
