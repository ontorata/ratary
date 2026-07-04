# Phase 6.5 — Progressive Retrieval — CHECKLIST

**Phase status:** ✅ Implemented (2026-07-04) · ADR-024 Accepted  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-024](../../../docs/adr/024-progressive-retrieval-policy.md)

---

## Implementation tracks

- [x] **6.5A** — `IRetrievalPolicy`, `IRetrievalBudget`, `RetrievalStage`, `RetrievalPlan` types
- [x] **6.5B** — `DefaultRetrievalPolicy` (pure, rule-based)
- [x] **6.5C** — Hook in `ContextService.buildContext`
- [x] **6.5D** — Additive `retrievalPlan` in REST/MCP responses
- [x] **6.5E** — Composition root + manifest flags
- [x] **6.5F** — Tests + docs

---

## Testing

- [x] Policy unit tests (stages, budget, version)
- [x] ContextService integration test (`retrievalPlan`)
- [x] Composition ports test
- [x] Non-regression: all tests green with default policy

---

## Documentation

- [x] DESIGN.md — Implemented, success criteria checked
- [x] IMPLEMENTATION.md, README.md, TESTING.md, CHECKLIST.md
- [x] ADR-024 — Accepted with implementation section
- [x] `.env.example` — `RETRIEVAL_POLICY_VERSION` documented

---

## Deferred

- [x] `RETRIEVAL_POLICY=legacy` alternate adapter — `LegacyRetrievalPolicy`; env `RETRIEVAL_POLICY=legacy`
- [x] Relations stage auto-expansion in context assembly — `relations` stage + `expandWithRelationNeighbors` when `GRAPH_RETRIEVAL=true`
- [x] ML-based adaptive policy adapter — `AdaptiveRetrievalPolicy` (rule-based hints); env `RETRIEVAL_POLICY=adaptive`
- [x] Token benchmark archived in [COMPLETION.md](COMPLETION.md) — CI: `tests/memory/token-benchmark.test.ts`; CLI: `benchmark:context-tokens` (**85.5%**)

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — Implemented 2026-07-04 |
| **ADR** | ADR-024 Accepted |
