# Phase 19 — Observability Platform — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-034 Implemented](../../adr/034-observability-platform.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 19A | `IMetricsExporter` + Prometheus in-memory adapter | ✅ |
| 19B | `ITraceExporter` + OTel bridge | ✅ |
| 19C | `ILogShipper` + stdout / Loki adapters | ✅ |
| 19D | `IDashboardPack` — 6 Grafana JSON bundles | ✅ |
| 19E | `ISloRegistry` + Alertmanager YAML templates | ✅ |
| 19F | REST middleware instrumentation | ✅ |
| 19G | `GET /metrics` scrape endpoint | ✅ |
| 19H | REST `/observability/*` admin API | ✅ |
| **D19-01** | Usage meter → cost gauges + embedding usage wiring | ✅ 2026-07-05 |

---

## File map

```
src/observability/
  types/           metrics, dashboard, slo, log types
  ports/           IMetricsExporter, ITraceExporter, ILogShipper, …
  adapters/        Prometheus, OTel, stdout/Loki, file dashboard/SLO, usage-cost-metrics-publisher
  catalog/         v1 metric namespace registrars
  middleware/      observability.middleware.ts
src/cloud/adapters/usage-meter-embedding-provider.ts
src/composition/create-observability-ports.ts
src/controllers/observability.controller.ts
src/routes/v1/observability.routes.ts
observability/dashboards/   overview, memory, embedding, graph, federation, cost
observability/slo/          slo-definitions.json, alertmanager-rules.yaml
tests/observability/
tests/api/observability.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `OBSERVABILITY_PLATFORM` | `false` | Master gate |
| `OBS_METRICS_PATH` | `/metrics` | Prometheus scrape path |
| `OBS_LOG_SHIPPER` | `stdout` | `none`, `stdout`, `loki` |
| `OBS_LOKI_PUSH_URL` | — | Loki push endpoint |
| `OBS_COST_METRICS_ENABLED` | `false` | Sync Phase 18 usage meter → cost gauges on scrape |
| `COST_EMBEDDING_USD_PER_REQUEST` | `0.00002` | FinOps estimate per embedding request |
| `COST_ESTIMATED_BYTES_PER_MEMORY` | `4096` | Storage gauge estimate per memory write event |
| `OTEL_ENABLED` | `false` | Trace export (existing C12; works with platform) |

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/metrics` | Prometheus scrape (public) |
| GET | `/api/v1/observability/status` | Layer status |
| GET | `/api/v1/observability/dashboards` | List dashboard packs |
| GET | `/api/v1/observability/dashboards/:packId` | Grafana JSON export |
| GET | `/api/v1/observability/slos` | SLO definitions |
| GET | `/api/v1/observability/alerts` | Alert rule templates |
| GET | `/api/v1/observability/alerts/export` | Alertmanager YAML |

---

## Separation from Phase 12

```
Phase 12 Event Bus     → business consumers (webhooks, analytics)
Phase 19 Observability → middleware counters/histograms + exporters
                         NO handler registered on business event bus
```

---

## Invariants

- `MemoryService` unchanged
- Default env = pre-Phase-19 behavior (noop exporters, no middleware)
- Metric labels exclude memory content (route sanitization)

---

## Deferred

- gRPC/MCP dedicated instrumentation hooks (REST middleware covers protocol label)
- Embedded Grafana/Prometheus stack (external only)
- Cost metric population from billing pipeline (gauges registered, values TBD)
