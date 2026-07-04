# Phase 19 — CHECKLIST

## ADR & design

- [ ] ADR-034 Approved
- [ ] DESIGN reviewed — separation from Phase 12 business bus explicit
- [ ] MemoryService unchanged confirmed in code review

## Ports & adapters

- [ ] `IMetricsExporter` port + noop adapter (default)
- [ ] `ITraceExporter` port + noop adapter (default)
- [ ] `ILogShipper` port + stdout adapter (default)
- [ ] `IDashboardPack` — Grafana JSON in `observability/dashboards/`
- [ ] `ISloRegistry` — templates in `observability/slo/`

## Instrumentation

- [ ] Middleware metrics at REST/gRPC/MCP boundary (Phase 13)
- [ ] OTel trace context propagation (W3C traceparent)
- [ ] Memory, embedding, graph, federation, cost metric namespaces defined
- [ ] PII redaction policy for log/metric labels documented

## Separation invariant

- [ ] No observability logic on Phase 12 business event handlers
- [ ] Exporters are sidecar/middleware only — no business state mutation

## Dashboard packs

- [ ] memory dashboard JSON
- [ ] embedding dashboard JSON
- [ ] graph dashboard JSON
- [ ] federation dashboard JSON
- [ ] cost dashboard JSON
- [ ] overview / golden signals dashboard JSON

## Alerting

- [ ] Alertmanager rule templates shipped
- [ ] SLO registry documents targets

## Feature flags & compatibility

- [ ] `OBSERVABILITY_PLATFORM=false` default
- [ ] `/metrics` route optional and additive
- [ ] REST v1 memory routes unchanged

## Documentation & gate

- [ ] External stack setup guide (Prometheus, Grafana, Tempo, Jaeger, Loki)
- [ ] `.env.example` updated
- [ ] [TESTING_PLAN.md](TESTING_PLAN.md) executed
- [ ] [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS
