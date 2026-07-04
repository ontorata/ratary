# Phase 19 — RISK_ANALYSIS

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-19-01 | Hot path latency regression | Medium | High | Noop default; async export; perf CI gate |
| R-19-02 | PII in metrics/logs/traces | Medium | Critical | Redaction policy; label allow-list; review |
| R-19-03 | Conflation with Phase 12 business bus | Medium | Medium | Architecture rule; code review; grep check |
| R-19-04 | Cardinality explosion (high label count) | Medium | High | Label allow-list; tenant id hashed/bucketed |
| R-19-05 | Dashboard drift from metric names | Medium | Low | Version dashboard packs with metric catalog |
| R-19-06 | OTel SDK dependency weight | Low | Medium | Optional dependency; tree-shake; flag OFF |
| R-19-07 | `/metrics` route exposure | Medium | Medium | Auth optional; network policy docs; internal scrape only |
| R-19-08 | Cost metrics misleading FinOps | Medium | Medium | Label as estimates; document calculation |
| R-19-09 | Trace sampling overhead | Low | Medium | Default 0%; configurable sampling |
| R-19-10 | Alert fatigue from default SLOs | Medium | Low | Templates are examples; tune in import |

## Residual risks

- **External stack availability** — not guaranteed by core; operators own Prometheus/Grafana SLA.
- **Cross-peer unified health** — federation dashboard limited to metrics this node exports about peers.

## Escalation

| Trigger | Action |
|---------|--------|
| PII detected in staging logs | Block merge; fix redaction |
| p99 regression > 5% with flag OFF | Block merge |
| Phase 12 business handler regression | Rollback; architecture review |
