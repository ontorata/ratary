# Phase 19 — IMPLEMENTATION_PLAN

**Principle:** One concern per commit. Exporters are adapters — no business logic. MemoryService unchanged.

| # | Commit | Scope |
|---|--------|-------|
| 1 | `docs(adr): approve ADR-034` | ADR status → Approved |
| 2 | `feat(obs): IMetricsExporter port + noop adapter` | `src/ports/observability/metrics.ts` |
| 3 | `feat(obs): ITraceExporter port + OTel noop provider` | `src/ports/observability/traces.ts` |
| 4 | `feat(obs): ILogShipper port + stdout adapter` | `src/ports/observability/logs.ts` |
| 5 | `feat(obs): middleware instrumentation hooks` | REST/gRPC/MCP middleware — noop sink default |
| 6 | `feat(obs): Prometheus adapter + optional /metrics route` | Flag-gated |
| 7 | `feat(obs): OTel Tempo/Jaeger exporter adapter` | Flag-gated |
| 8 | `feat(obs): Loki log shipper adapter` | Flag-gated |
| 9 | `feat(obs): memory + embedding metric registrars` | Counter/histogram definitions |
| 10 | `feat(obs): graph + federation + cost metrics` | Additive registrars |
| 11 | `feat(obs): protocol metrics from Phase 13 hooks` | Label by transport |
| 12 | `feat(obs): IDashboardPack — Grafana JSON bundles` | `observability/dashboards/` |
| 13 | `feat(obs): ISloRegistry + Alertmanager templates` | `observability/slo/` |
| 14 | `chore(env): OBSERVABILITY_PLATFORM flag` | `.env.example`, composition root |
| 15 | `docs(obs): external stack setup guide` | Prometheus/Grafana/Tempo/Loki |
| 16 | `test(obs): exporter unit + middleware integration` | Per TESTING_PLAN |
| 17 | `docs(phase): gate evidence` | TESTING, COMPLETION |

## Composition root wiring

```
OBSERVABILITY_PLATFORM=true  → Prometheus + OTel + Loki adapters
OBSERVABILITY_PLATFORM=false → all noop/stdout — pre-19 behavior
```

## Explicit non-goals per commit

- No Phase 12 business bus handler registration for metrics
- No Grafana server embedded in repo
- No MemoryService method changes

## Blockers

- Phase 13 middleware extension points for protocol instrumentation
- ADR-034 Approved before commit 2

## Optional follow-on (post-gate)

- Phase 18 cloud dashboard panels (depends on Phase 18 metrics)
- Phase 16 SDK trace header documentation update
