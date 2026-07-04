# Phase 19 — ARCHITECTURE_UPDATE

**Target document:** [.ai/core/architecture/04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Apply when:** ADR-034 **Approved**.

---

## Sections to add or extend

### 1. Observability layer (new)

```
Middleware boundary → IMetricsExporter | ITraceExporter | ILogShipper
Repository root     → noop when OBSERVABILITY_PLATFORM=false
```

### 2. New ports

| Port | Location | Default |
|------|----------|---------|
| `IMetricsExporter` | `src/ports/observability/` | Noop |
| `ITraceExporter` | `src/ports/observability/` | Noop |
| `ILogShipper` | `src/ports/observability/` | Stdout |
| `IDashboardPack` | `observability/dashboards/` | Versioned JSON |
| `ISloRegistry` | `observability/slo/` | Versioned YAML |
| `IObservabilityConfig` | Composition root | Env |

### 3. Dashboard packs (repo artifacts)

Document Grafana JSON bundles: Health, Performance, Memory, Embedding, Graph, Cost — **not** embedded in server binary.

### 4. PII / redaction policy

Metrics labels and log fields — reference compliance section (Phase 17 audit export).

---

## Sections unchanged

- Phase 12 event pipeline (business events ≠ operational telemetry)
- MemoryService logic

---

## Verification checklist

- [ ] Default OFF = zero export overhead target documented
- [ ] OTel as optional sidecar pattern
- [ ] Link ADR-034
