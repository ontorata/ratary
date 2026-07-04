# Phase 6.5 — Progressive Retrieval — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-024 Accepted](../../adr/024-progressive-retrieval-policy.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Policy port | `IRetrievalPolicy` + `DefaultRetrievalPolicy` | ✅ |
| Legacy adapter | `LegacyRetrievalPolicy` — `RETRIEVAL_POLICY=legacy` | ✅ |
| Adaptive adapter | `AdaptiveRetrievalPolicy` — `RETRIEVAL_POLICY=adaptive` | ✅ |
| Relations expansion | `expandWithRelationNeighbors` + `relations` stage | ✅ |
| Types | `IRetrievalBudget`, `RetrievalPlan`, `RetrievalStage` | ✅ |
| Hook | `ContextService.buildContext` — policy after rank, before hydration | ✅ |
| Response | Additive `retrievalPlan` in REST/MCP context responses | ✅ |
| Composition | `create-progressive-retrieval-ports.ts` | ✅ |
| Manifest | `supportsProgressiveRetrieval`, `progressivePolicyVersion` | ✅ |
| Env | `RETRIEVAL_POLICY`, `RETRIEVAL_POLICY_VERSION`, `RETRIEVAL_RELATION_NEIGHBOR_CAP`, hybrid/graph flags | ✅ |

---

## File map

```
src/memory/retrieval-policy/
  retrieval-stage.ts
  retrieval-budget.ts
  iretrieval-policy.interface.ts
  default-retrieval-policy.ts
  legacy-retrieval-policy.ts
  adaptive-retrieval-policy.ts
  relation-context-expander.ts
  retrieval-policy-hints.ts
  index.ts
src/composition/create-retrieval-policy.ts
src/memory/context.service.ts           # policy hook + hydration gate
src/memory/create-context-service.ts    # wires progressive ports + composite source
src/composition/create-progressive-retrieval-ports.ts
src/controllers/context.controller.ts   # passes retrievalPlan in REST response
tests/memory/default-retrieval-policy.test.ts
tests/memory/context.service.test.ts
tests/composition/progressive-retrieval-ports.test.ts
```

---

## Wiring

```typescript
createProgressiveRetrievalPorts(env) → {
  policy: DefaultRetrievalPolicy(env.RETRIEVAL_POLICY_VERSION),
  deployment: { hybridRetrieval, graphRetrieval, maxContextMaxChars },
}

createContextService(repository, platform) →
  ContextService(..., { retrievalPolicy, deployment })
```

---

## Progressive flow

```
buildContext(request)
  → Retriever.retrieve (metadata projection — O-04-2, no body)
  → Ranker.rank
  → IRetrievalPolicy.resolve → RetrievalPlan
  → [optional] findByIdsWithContent when plan.hydrateBody
  → ContextBuilder.build(plan.budget)
  → return { context, memories, retrievalPlan }
```

---

## Non-regression

- Default policy: summary-only path (`includeSummaryOnly !== false`)
- `MemoryService`, `Retriever`, `Ranker` signatures unchanged
- MCP `get_context` / `build_prompt` tool schemas unchanged

---

## Rollback

Policy is always-on with default adapter (matches pre-6.5 behavior). Clients ignore optional `retrievalPlan` field.
