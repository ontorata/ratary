# ADR-034: Observability Platform — OTel, Metrics, Dashboards (Phase 19)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 12 delivers event pipeline. Phase 13 adds protocol benchmark. Enterprise SRE requires **full observability stack**: OpenTelemetry export, Prometheus metrics, Grafana dashboards (memory, embedding, graph, cost), Tempo/Jaeger traces, Loki logs, Alertmanager rules.

## Problem

- OTel wired but no platformized dashboards/SLOs.
- No unified health across federation peers.
- Cost/embedding observability gaps.

## Constraints

- Observability = **adapters + exporters** — not business logic.
- Default OFF exporters; no performance regression on hot path when disabled.
- Separate from Phase 12 event **business** consumers.

## Decision

1. `IMetricsExporter` — Prometheus adapter.
2. `ITraceExporter` — OTel → Tempo/Jaeger.
3. `ILogShipper` — structured logs → Loki.
4. `IDashboardPack` — Grafana JSON templates (versioned in repo).
5. `ISloRegistry` — SLO definitions + alert rules templates.

## Rollback

`OBSERVABILITY_PLATFORM=false` — Phase 12 noop bus unchanged.

## References

- Phase 12, Phase 13 benchmark, Phase 19 DESIGN
