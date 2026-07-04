# Phase 6.5 — Progressive Retrieval — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Delivered `DefaultRetrievalPolicy` hook in `ContextService.buildContext` producing additive `retrievalPlan`. Always-on default adapter; no master env flag. Post-gate follow-up (2026-07-04): legacy/adaptive policy adapters, one-hop relations stage expansion, admin compress REST.

Evidence: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md) · [CHECKLIST.md](CHECKLIST.md).

---

## What worked well

- Default adapter matches pre-6.5 summary-only behavior — backward compatible
- Body hydration gated via `plan.hydrateBody` + `findByIdsWithContent`
- One-hop relations expansion when `GRAPH_RETRIEVAL=true` — `expandWithRelationNeighbors` + `RETRIEVAL_RELATION_NEIGHBOR_CAP`
- Manifest exposes `supportsProgressiveRetrieval`, policy version, and `retrievalPolicy`
- MCP/REST schemas unchanged; clients may ignore optional `retrievalPlan`

---

## What was harder than expected

- ~~`RETRIEVAL_POLICY=legacy` alternate adapter~~ — landed `LegacyRetrievalPolicy` + env switch
- ~~Relations stage auto-expansion~~ — `expandWithRelationNeighbors` when graph enabled
- ~~ML adaptive retrieval policy~~ — `AdaptiveRetrievalPolicy` (rule-based hints, not online ML)

---

## Accepted debt (at gate)

- ~~Single default policy~~ — `RETRIEVAL_POLICY` selects default | legacy | adaptive
- Deep BFS graph traverse remains `traverse_relations` MCP (relations stage is one-hop summaries only)

---

## Successor closure (2026-07-04)

| Deferred item | Closed by |
|---------------|-----------|
| Legacy policy adapter | `LegacyRetrievalPolicy`, `RETRIEVAL_POLICY=legacy` |
| Relations auto-expansion | `relations` stage + `relation-context-expander.ts` |
| Adaptive policy adapter | `AdaptiveRetrievalPolicy`, `RETRIEVAL_POLICY=adaptive` |
| Token benchmark | SC-65-06 + `token-benchmark.test.ts` in CI |

---

## Recommendations

- ~~Implement relations-stage expansion before high-graph deployments~~ ✅ done 2026-07-04 — `relations` stage + `relation-context-expander.ts`; deep BFS still via `traverse_relations` MCP
- ~~Add token benchmark evidence to COMPLETION.md~~ ✅ done 2026-07-04
- For high-graph production: validate `RETRIEVAL_RELATION_NEIGHBOR_CAP` and neighbor noise under real graph density (ops tuning)

---

*Recorded at gate 2026-07-04. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
