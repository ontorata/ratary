# Phase 19 — MIGRATION_PLAN

## Compatibility matrix

| Deployment | Before Phase 19 | After (flag OFF) | After (flag ON) |
|------------|-----------------|------------------|-----------------|
| Single-node dev | Works | **Identical** | + `/metrics`, trace export |
| Phase 12 webhooks | Business bus | **Unchanged** | **Unchanged** — separate path |
| REST v1 memory | Frozen | **Unchanged** | Unchanged |
| Log format | Structured JSON | **Same format** | + optional Loki push |
| Performance | Baseline | **Target: identical** | Async export; sampling configurable |

## Rollout phases

### R1 — Dark launch

- Ship ports + noop adapters; `OBSERVABILITY_PLATFORM=false`
- Full regression suite — confirm zero delta vs baseline

### R2 — Staging stack

- Deploy external Prometheus + Grafana + Tempo + Loki (operator infra)
- Enable flag in staging; import dashboard packs
- Validate panel data population

### R3 — Production canary

- Enable for one node / low sampling rate (e.g. 1% traces)
- Monitor hot path p99 and error rates
- Import Alertmanager rules; tune thresholds

### R4 — GA

- Document runbooks: dashboard import, alert response, trace lookup
- FinOps review of cost dashboard accuracy (estimates labeled as such)

## Phase 12 separation migration

| Concern | Action |
|---------|--------|
| Existing business event handlers | **Do not modify** |
| New observability signals | Emit from middleware only |
| Documentation | Explicit diagram in ops guide: bus ≠ telemetry |

## Data migration

**None required.** Observability is stateless export — no new business tables.

Optional: external Prometheus/Loki retention policies — operator responsibility.

## Rollback procedure

1. Set `OBSERVABILITY_PLATFORM=false`
2. Restart nodes — noop exporters active
3. Remove `/metrics` from load balancer scrape config (optional)
4. External Grafana dashboards may remain — no core dependency
5. Phase 12 business consumers unaffected

## Downstream impact

| Phase | Impact |
|-------|--------|
| 20 AI Infrastructure | Plugin health metrics added post-20 |
| 16 SDK | Trace header propagation docs |
| 18 Cloud | Cloud dashboard pack cross-reference |

## No migration required for

- Memory data
- Federation peer config
- Agent runtime (external)
