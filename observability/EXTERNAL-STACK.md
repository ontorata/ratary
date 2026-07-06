# External Observability Stack

Ratary ships **dashboard packs**, **SLO templates**, and **Prometheus exposition** — not a bundled Prometheus/Grafana/Loki stack. Operators bring their own observability backend.

---

## Quick start

1. Enable the platform layer in Ratary:

```bash
OBSERVABILITY_PLATFORM=true
```

2. Scrape metrics from Ratary (default path `/metrics`):

```bash
curl -s http://localhost:3000/metrics
```

3. Import Grafana dashboards from `observability/dashboards/`:

| Pack ID | File | Focus |
|---------|------|-------|
| `overview` | `overview.json` | Request rate, latency, errors |
| `memory` | `memory.json` | Memory CRUD, search |
| `embedding` | `embedding.json` | Embedding provider latency |
| `graph` | `graph.json` | Knowledge graph ops |
| `federation` | `federation.json` | Federation sync |
| `cost` | `cost.json` | FinOps gauges (requires cost bridge — see below) |

4. Apply SLO templates from `observability/slo/slo-definitions.json` and Alertmanager rules from `observability/slo/alertmanager-rules.yaml`.

---

## Environment flags

| Variable | Default | Purpose |
|----------|---------|---------|
| `OBSERVABILITY_PLATFORM` | `false` | Master gate — metrics, traces, logs, admin API |
| `OBS_METRICS_PATH` | `/metrics` | Prometheus scrape path |
| `OBS_LOG_SHIPPER` | `stdout` | `none`, `stdout`, or `loki` |
| `OBS_LOKI_PUSH_URL` | — | Loki push endpoint when shipper is `loki` |
| `OTEL_ENABLED` | `false` | OpenTelemetry trace export (works with platform) |

**Cost bridge (D19-01 — Phase 18 integration):**

| Variable | Default | Purpose |
|----------|---------|---------|
| `OBS_COST_METRICS_ENABLED` | `false` | On each `/metrics` scrape, sync Phase 18 usage meter → cost gauges |
| `COST_EMBEDDING_USD_PER_REQUEST` | `0.00002` | FinOps estimate per embedding request |
| `COST_ESTIMATED_BYTES_PER_MEMORY` | `4096` | Storage gauge estimate per memory write event |

Cost gauges require Phase 18 metering:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CONTROL_PLANE_ENABLED` | `false` | Control plane (prerequisite for usage meter) |
| `USAGE_METER_ENABLED` | `false` | Event-driven usage aggregation |

**Staging enable path (cost dashboard populated):**

```bash
OBSERVABILITY_PLATFORM=true
CONTROL_PLANE_ENABLED=true
USAGE_METER_ENABLED=true
OBS_COST_METRICS_ENABLED=true
```

---

## Cost metrics (D19-01)

When `OBS_COST_METRICS_ENABLED=true` and the usage meter is active, each Prometheus scrape publishes:

| Gauge | Description |
|-------|-------------|
| `ratary_cost_embedding_estimate_usd` | Cumulative embedding cost estimate from meter events |
| `ratary_cost_storage_bytes` | Estimated storage bytes from memory write events |

Implementation: `src/observability/adapters/usage-cost-metrics-publisher.ts` reads the Phase 18 `IUsageMeter` snapshot and writes gauges before exposition. Embedding calls routed through `UsageMeterEmbeddingProvider` record `embedding.request` events.

Import `observability/dashboards/cost.json` into Grafana after the gauges appear on scrape.

---

## Prometheus scrape config (example)

```yaml
scrape_configs:
  - job_name: ratary
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
    scrape_interval: 15s
```

---

## Loki log shipping

When `OBS_LOG_SHIPPER=loki` and `OBS_LOKI_PUSH_URL` is set, structured request logs ship to Loki. Default `stdout` requires no external stack.

---

## Admin API

When `OBSERVABILITY_PLATFORM=true`:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/observability/status` | Layer status |
| GET | `/api/v1/observability/dashboards` | List dashboard packs |
| GET | `/api/v1/observability/dashboards/:packId` | Export Grafana JSON |
| GET | `/api/v1/observability/slos` | SLO definitions |
| GET | `/api/v1/observability/alerts` | Alert rule templates |

---

## Separation from Phase 12

Phase 12 **business event bus** (webhooks, analytics consumers) is separate from Phase 19 **operational telemetry**. Observability hooks live at the HTTP middleware boundary — no OTLP handler on memory domain events.

See also: [GUIDE — Observability](../docs/GUIDE.md#11-observability)
