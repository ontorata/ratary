# Phase 19 — TASK_PROMPT

**Blocked until ADR-034 Approved.**

Implement Observability Platform as **exporter ports + middleware instrumentation + dashboard/SLO templates** — OpenTelemetry traces, Prometheus metrics, Loki log shipping, Grafana dashboard packs, Alertmanager rules. **Separate from Phase 12 business event consumers. MemoryService unchanged.**

## Deliverables

1. **`IMetricsExporter`** — Prometheus adapter; noop default
2. **`ITraceExporter`** — OTel → Tempo/Jaeger; noop default
3. **`ILogShipper`** — structured logs → Loki; stdout default
4. **`IDashboardPack`** — Grafana JSON: memory, embedding, graph, federation, cost, overview
5. **`ISloRegistry`** — SLO definitions + Alertmanager templates
6. Middleware instrumentation at protocol boundary (Phase 13) — counters, histograms, trace context
7. Feature flag `OBSERVABILITY_PLATFORM=false` default — zero export overhead target
8. Optional `/metrics` scrape route (additive)

## Constraints

- Clean Architecture: ports in `src/ports/observability/`, adapters at composition root
- Do NOT register observability handlers on Phase 12 **business** event bus
- No MemoryService changes
- No hosting Grafana/Prometheus/Loki in core repo
- No breaking REST v1 / MCP schemas
- Default OFF — no performance regression on hot path when disabled

## Read first

- [DESIGN.md](DESIGN.md)
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
- [ADR-034](../../adr/034-observability-platform.md)

## Gate

All [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS · [CHECKLIST.md](CHECKLIST.md) complete · `npm test` green with flag OFF · perf gate with flag ON.
