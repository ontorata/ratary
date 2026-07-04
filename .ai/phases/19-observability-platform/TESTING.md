# Phase 19 — Observability Platform — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Composition gate | `tests/observability/observability-ports.test.ts` | enabled/disabled ports |
| Prometheus export | `tests/observability/prometheus-exporter.test.ts` | counter/histogram text |
| Dashboard + SLO | `tests/observability/dashboard-slo.test.ts` | 6 packs, SLO/alerts YAML |
| Admin REST + /metrics | `tests/api/observability.test.ts` | scrape, status, dashboards |
| Server regression | full `npm test` (612 tests) | MemoryService unchanged |

---

## Manual smoke

```bash
OBSERVABILITY_PLATFORM=true OBS_LOG_SHIPPER=none npm run dev

curl http://localhost:3000/metrics
curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/observability/status
curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/observability/dashboards
```

With traces:

```bash
OBSERVABILITY_PLATFORM=true OTEL_ENABLED=true npm run dev
```

---

## Quality gate

- [x] Default regression (`OBSERVABILITY_PLATFORM=false`) — 612 tests green
- [x] Observability API subset with flags ON
- [x] No Phase 12 business bus observability handler
- [x] Dashboard JSON + SLO templates valid in repo
