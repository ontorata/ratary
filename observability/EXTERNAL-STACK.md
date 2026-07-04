# External Observability Stack (Phase 19)

Runbook for wiring AI Brain metrics/traces/logs to a Prometheus/Grafana/Tempo/Loki stack.

## Prerequisites

- AI Brain deployed with `OBSERVABILITY_ENABLED=true`
- Optional: `OTEL_EXPORTER_OTLP_ENDPOINT` for trace export

## Prometheus

Scrape the metrics endpoint (default REST):

```bash
curl -s http://localhost:3000/metrics | head
```

Add job to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: ai-brain
    static_configs:
      - targets: ['host.docker.internal:3000']
```

## Grafana

Import bundled dashboards from `observability/dashboards/`:

- `overview.json` — request rate, latency, errors
- `memory.json` — memory CRUD and retrieval
- `embedding.json`, `graph.json`, `federation.json`, `cost.json`

SLO definitions: `observability/slo/slo-definitions.json`  
Alert rules: `observability/slo/alertmanager-rules.yaml`

## Tempo / OTLP traces

Set in `.env`:

```env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces
```

## Loki

When `LOG_SHIPPER=loki`, configure `LOKI_URL` and verify structured logs include `requestId` and `ownerId` (no PII in message body).

## Local smoke

```bash
npm test -- tests/observability
```

See [ADR-034](../../.ai/adr/034-observability-platform.md).
