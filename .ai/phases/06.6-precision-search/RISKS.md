# Phase 6.6 — Precision Search Platform — RISKS

**Status:** ✅ Reviewed at implementation (2026-07-05)

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|------------|--------|------------|--------|
| R66-1 | Search/context boundary blur confuses agents | Med | High | Keep Phase 6.5 policy unchanged; document in capability manifest | Mitigated |
| R66-2 | Enricher N+1 relation queries slow search | Med | Med | Batch relation load; `SEARCH_ENRICH_LINK_CAP` | Mitigated (cap=20) |
| R66-3 | ONNX rerank model download fails CI/air-gap | Med | Low | Default noop; lexical fallback reranker | Mitigated |
| R66-4 | Local embed native deps break Vercel deploy | High | Med | Local provider opt-in only; noop default on serverless | Accepted |
| R66-5 | Multi-query RRF latency multiplies | Med | Med | `SEARCH_MAX_QUERIES` cap + sequential execution + `queries_truncated` warning | Mitigated (cap=5) |
| R66-6 | `source_path` collision on import | Low | Med | UNIQUE per owner; import conflict returns 409 | Mitigated |
| R66-7 | Alias boost dominates ranking unfairly | Med | Low | Tunable env weights; unit tests | Mitigated |
| R66-8 | Meilisearch optional — hybrid mode weak on D1-only | Med | Med | Document degraded mode; sql leg weights tuned | Accepted |
