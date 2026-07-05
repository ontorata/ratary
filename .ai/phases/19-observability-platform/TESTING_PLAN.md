# Phase 19 — TESTING_PLAN

## Suite matrix

| Suite | Scope | Flags |
|-------|-------|-------|
| **Default regression** | Full `npm test` | OFF |
| **Port unit — IMetricsExporter** | counter, histogram, gauge register + export | Mock registry |
| **Port unit — ITraceExporter** | span start/end, context inject/extract | Noop provider |
| **Port unit — ILogShipper** | JSON line format, batch push mock | Mock Loki |
| **Integration — /metrics** | Scrape endpoint returns Prometheus text | ON |
| **Integration — trace export** | HTTP request produces span in mock backend | ON, 100% sampling in test |
| **Integration — log shipper** | Request produces structured log line | ON |
| **Separation — Phase 12 bus** | No observability handler on business bus | grep/review |
| **Middleware — REST/gRPC/MCP** | Duration histogram recorded per transport | ON |
| **Metric catalog** | memory, embedding, graph, federation, cost namespaces present | ON |
| **Dashboard smoke** | JSON valid; import script succeeds | CI lint |
| **SLO templates** | YAML/JSON schema valid | CI lint |
| **Performance — hot path OFF** | p99 vs baseline ≤ 5% delta | OFF |
| **Performance — hot path ON** | p99 vs baseline ≤ 10% delta | ON, async |
| **Rollback** | OFF → noop; no export side effects | OFF |
| **PII redaction** | Labels/logs exclude memory content | ON |

## External stack verification (staging)

| Component | Verify |
|-----------|--------|
| Prometheus | Scrapes `/metrics`; targets healthy |
| Grafana | All 6 dashboard packs render |
| Tempo/Jaeger | Trace lookup by trace ID from response header |
| Loki | `{service="ai-brain"}` query returns request logs |
| Alertmanager | Test alert fires on injected high error rate |

## MemoryService invariant

| Check | Method |
|-------|--------|
| No MemoryService diff | Git baseline comparison |
| Service unit tests | Unchanged pass count with flag OFF |

## CI gates

- [ ] Unit + integration pass
- [ ] Dashboard JSON lint job
- [ ] Perf micro-benchmark job (optional nightly)
- [ ] Default regression required for merge

## Manual verification

- [ ] Ops guide: stack install + dashboard import
- [ ] SLO review with stakeholder
- [ ] Confirm Phase 12 webhook tests still pass unchanged
