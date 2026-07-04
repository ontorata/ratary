# Phase 19 — Observability Platform — DESIGN

**Document:** DESIGN · **ADR:** [ADR-034](../../adr/034-observability-platform.md) · **Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## 1. Mengapa phase ini diperlukan?

Phase 12 delivers an **event pipeline** for business/async consumers. Phase 13 adds protocol surfaces and benchmark hooks. Enterprise SRE teams require a **full observability stack**: standardized metrics, distributed traces, centralized logs, SLO dashboards, and alert rules — without embedding observability logic in MemoryService or business handlers.

Without Phase 19:

- OpenTelemetry may be partially wired but **no platformized** Grafana dashboards, SLO registry, or Alertmanager rules exist in-repo.
- Operators lack unified visibility across memory ops, embedding latency, graph queries, federation peers, and cost signals.
- Phase 12 event consumers (webhooks, analytics) are conflated with **telemetry export** — risking hot-path regression and unclear ownership.
- Enterprise buyers cannot meet SOC2/ISO operational monitoring requirements.

Phase 19 adds **observability ports + exporters + dashboard packs** — adapters only, default OFF.

---

## 2. Mengapa tidak digabung dengan phase lain?

| Phase | Why separate |
|-------|--------------|
| 12 Event Pipeline | **Business** async consumers (webhooks, workflows) — not Prometheus/Loki export |
| 13 Protocol | Wire adapters — not metrics backend selection |
| 18 Cloud Platform | Provisioning/DR — **feeds** observability, doesn't define OTel stack |
| 17 Enterprise Security | Audit **events** exported here — policy authoring stays in 17 |
| 20 AI Infrastructure | Marketplace capstone — observability **monitors** plugins, doesn't register them |

**Coupling avoided:** Business events ≠ telemetry export ≠ dashboard authoring ≠ SLO policy.

---

## 3. Scope

### In scope

| Deliverable | Detail |
|-------------|--------|
| **`IMetricsExporter` port** | Prometheus-format metrics scrape endpoint / push adapter |
| **`ITraceExporter` port** | OpenTelemetry → Tempo / Jaeger backend |
| **`ILogShipper` port** | Structured logs → Loki (or compatible) |
| **`IDashboardPack` port** | Versioned Grafana JSON templates in repo |
| **`ISloRegistry` port** | SLO definitions + Alertmanager rule templates |
| **OpenTelemetry integration** | Trace context propagation across REST/gRPC/MCP (Phase 13) |
| **Dashboard packs** | Memory, embedding, graph, federation, cost, control plane (Phase 18) |
| **Alertmanager templates** | Latency, error rate, saturation, cost anomaly |
| **Feature flag** | `OBSERVABILITY_PLATFORM=false` default |

### Out of scope

- Business logic in exporters (ranking, retrieval, billing calculation)
- MemoryService changes
- Replacing Phase 12 noop/event bus architecture
- Hosting Grafana/Prometheus/Loki/Tempo in core repo (templates + adapter config only)
- Agent runtime telemetry (external — SDK may forward trace headers)

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Brain Server — handlers & services (unchanged logic)         │
│  MemoryService │ ContextService │ Federation │ …                 │
└───────┬─────────────────┬─────────────────┬───────────────────┘
        │ spans           │ structured logs   │ internal counters
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Observability layer (Phase 19 — adapters, default OFF)            │
│  IMetricsExporter │ ITraceExporter │ ILogShipper                 │
│  OTel SDK (thin instrumentation at middleware boundary)          │
└───────┬─────────────────┬─────────────────┬───────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
   Prometheus         Tempo/Jaeger         Loki
        │                 │                 │
        └────────┬────────┴────────┬────────┘
                 ▼                 ▼
            Grafana + Alertmanager (external stack)
                 ▲
         IDashboardPack │ ISloRegistry (JSON in repo)
```

### Separation from Phase 12 events

```
Phase 12 Event Bus                    Phase 19 Observability
─────────────────────                 ────────────────────────
Business domain events                Telemetry signals
Webhook / workflow consumers          Prometheus / OTel / Loki
MAY affect business state             NEVER mutates business state
Optional async handlers               Sidecar export only
```

**Rule:** Observability subscribers **must not** register on the Phase 12 business bus for hot-path work. Metrics/traces/logs emit from middleware + thin instrumentation hooks — not duplicated domain event handlers.

---

## 5. Extension points & interfaces

| Port / Contract | Location | Purpose | Default adapter |
|-----------------|----------|---------|-----------------|
| `IMetricsExporter` | `src/ports/observability/` | Counter/histogram/gauge export | Noop |
| `ITraceExporter` | `src/ports/observability/` | OTel span export | Noop |
| `ILogShipper` | `src/ports/observability/` | JSON log stream ship | Stdout only |
| `IDashboardPack` | `observability/dashboards/` | Grafana JSON bundles | Versioned files |
| `ISloRegistry` | `observability/slo/` | SLO + alert templates | Versioned YAML/JSON |
| `IObservabilityConfig` | Composition root | Backend URLs, sampling rates | Env-based |

### Metric catalog (v1)

| Namespace | Examples |
|-----------|----------|
| `ai_brain_memory_*` | CRUD latency, search QPS, cache hit ratio |
| `ai_brain_embedding_*` | Provider latency, token count, error rate |
| `ai_brain_graph_*` | Traversal latency, node/edge ops |
| `ai_brain_federation_*` | Peer sync lag, egress bytes |
| `ai_brain_cost_*` | Embedding cost estimate, storage bytes (gauge) |
| `ai_brain_protocol_*` | REST/gRPC/MCP request duration (Phase 13) |
| `ai_brain_cloud_*` | Control plane ops (Phase 18, optional) |

### Trace propagation

- W3C `traceparent` / `tracestate` on REST and gRPC (Phase 13 middleware)
- MCP remote: trace context in HTTP headers (Phase 16 SDK optional)
- Sampling: configurable — default 0% when `OBSERVABILITY_PLATFORM=false`

### Dashboard packs (`IDashboardPack`)

| Pack | Panels |
|------|--------|
| **memory** | CRUD rates, search latency p50/p99, error ratio |
| **embedding** | Provider breakdown, latency, throughput, failures |
| **graph** | Query duration, result size, adapter health |
| **federation** | Peer status, sync lag, conflict count |
| **cost** | Embedding spend estimate, storage growth |
| **overview** | Golden signals — latency, traffic, errors, saturation |

### SLO registry (`ISloRegistry`)

| SLO | Target (example) |
|-----|------------------|
| Memory search availability | 99.9% |
| Memory search p99 latency | < 500ms |
| Embedding error rate | < 0.1% |
| Federation sync freshness | < 5 min lag |

Alertmanager templates ship alongside — operators import into their stack.

---

## 6. Dependency rule

```
Request → middleware (trace + metrics + log context)
        → Auth (17) → Handlers → MemoryService

OBSERVABILITY_PLATFORM=true → exporters active at middleware boundary
OBSERVABILITY_PLATFORM=false → noop exporters; zero export overhead target
```

**Forbidden:**

- Observability adapter calling MemoryService for metric **values** (use instrumentation counters only)
- Business event handlers performing Prometheus scrape logic
- Dashboard JSON executed in-process (external Grafana only)

---

## 7. Migration strategy

| Step | Action | Server impact |
|------|--------|---------------|
| M1 | Add ports + noop adapters; flag OFF | None measurable |
| M2 | Middleware instrumentation (counters/histograms) — noop sink | Additive middleware |
| M3 | OTel trace provider — noop exporter default | Sampling 0% default |
| M4 | Prometheus scrape endpoint (optional route) | New route; not on hot path if disabled |
| M5 | Log shipper adapter (Loki push) | Structured JSON logs unchanged format |
| M6 | Ship dashboard + SLO templates in `observability/` | Docs/assets only |
| M7 | Phase 13 benchmark hooks → protocol metrics | Additive labels |

**Compatibility:**

- Phase 12 event bus: **unchanged** — no observability handler registered on business bus
- Default env: identical behavior and performance target vs pre-Phase-19
- REST v1 / MCP: no breaking changes; optional `/metrics` route additive

---

## 8. Impact summary

| Dimension | Impact |
|-----------|--------|
| Scalability | External observability stack scales independently |
| Enterprise | **Primary beneficiary** — SRE dashboards, SLOs, alerts |
| Security | Audit logs shippable to Loki; no PII in metric labels (redaction policy) |
| Developer | Phase 16 SDK `--verbose` trace header propagation documented |
| Federation | Unified peer health dashboard |
| Cloud | Phase 18 control plane metrics in cloud dashboard pack |
| Governance | SLO registry versioned in repo |
| AI ecosystem | Embedding/graph cost visibility for FinOps |

---

## 9. Rollback

| Flag / action | Effect |
|---------------|--------|
| `OBSERVABILITY_PLATFORM=false` | Noop all exporters; middleware uses noop sink |
| Remove scrape route | `/metrics` 404 — no memory API impact |
| Delete external Grafana dashboards | Core unaffected — templates remain in repo |

Phase 12 noop bus and business consumers: **unchanged on rollback**.

---

## 10. References

- [ADR-034](../../adr/034-observability-platform.md) — Observability Platform decision
- Phase 12 — Event Pipeline (business consumers)
- Phase 13 — Protocol surfaces
- Phase 18 — Cloud Platform (optional metrics)
- [11-ENTERPRISE-ROADMAP.md](../roadmap/11-ENTERPRISE-ROADMAP.md)

*Implementation: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md).*
