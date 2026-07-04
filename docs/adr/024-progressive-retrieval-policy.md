# ADR-024: Progressive Retrieval Policy

**Status:** Approved  
**Date:** 2026-07-04  
**Approved:** 2026-07-04 (owner — DESIGN + implementation plan)  
**Deciders:** Project owner  

---

## Context

Phase 4 established `Retriever` → `Ranker` → `ContextBuilder` with O-04-2 retrieval projection (empty `content` in candidates). Phase 6 added `CompositeRetrievalCandidateSource` (SQL + vector). Phase 8 added graph seed leg. Recent work added `findByIdsWithContent` hydration and MCP `content_mode: summary|full`.

Behavior exists but is **implicit**. Architecture Review (2026-07-04) approved **Phase 6.5 Progressive Retrieval** to formalize staged, budget-aware retrieval.

Design reference: [.ai/phases/06.5-progressive-retrieval/DESIGN.md](../../.ai/phases/06.5-progressive-retrieval/DESIGN.md)

Related: [ADR-001](001-multi-source-retrieval.md), Phase 7 DESIGN §11 MCP context contract.

---

## Problem

| Gap today | Need |
|-----------|------|
| Implicit stage ordering | Explicit **IRetrievalPolicy** + **RetrievalPlan** |
| Budget split across `max_chars`, `limit`, env flags | Unified **IRetrievalBudget** |
| No policy version in responses | Manifest + debugging (`retrievalPolicyVersion`) |
| Risk of unbounded body fetch | Policy gate before `findByIdsWithContent` |
| Adaptive behavior undefined | Rule-based caps only (importance, access_count) — no ML |

Without an ADR, progressive retrieval may fork `Retriever` or merge REST search with context pipeline.

---

## Constraints

- **No `RetrieverV2`, `ContextServiceV2`, or `MemoryService` changes.**
- Default policy MUST reproduce current production behavior exactly when `RETRIEVAL_POLICY=default`.
- REST paginated search (`SearchService`) remains separate from LLM context path ([04-ARCHITECTURE.md](../../.ai/core/architecture/04-ARCHITECTURE.md) §5).
- O-04-2 projection preserved for stage 0 candidates.
- MCP tool signatures unchanged; optional `retrievalPlan` in response only.
- `IRetrievalPolicy` is **pure** (no I/O).
- Implementation blocked until **Approved**.

---

## Alternatives

### Option A — `IRetrievalPolicy` port + hook in `ContextService` only

- Pros: Minimal blast radius; formalizes existing hydration; testable pure policy.
- Cons: Policy must stay in sync with env flags (hybrid/graph).

### Option B — Multi-round retriever loops inside `Retriever`

- Pros: Could optimize per-stage fetches dynamically.
- Cons: Latency risk; blurs retriever vs policy; rejected (agent-like behavior).

### Option C — Client-side progressive fetch only

- Pros: No server changes.
- Cons: Token waste; inconsistent clients; violates protocol-native access (Constitution §30).

---

## Decision

**Adopt Option A** (pending owner Approval):

1. **Stages (ordered):** metadata → summary → body → [relations] → [vector leg] → [graph leg].
2. **Ports:** `IRetrievalPolicy`, `IRetrievalBudget`, `RetrievalPlan` (pure types).
3. **Hook:** `ContextService.buildContext` calls policy after rank, before hydration/build.
4. **Default policy:** `includeSummaryOnly=true` (MCP default); hydrate body only when `content_mode=full` / `includeSummaryOnly=false`.
5. **Graph deep traverse:** remains `traverse_relations` MCP tool — not auto-inlined in every `get_context`.
6. **Env:** `RETRIEVAL_POLICY=default`; `RETRIEVAL_POLICY_VERSION=1`.
7. **Response:** optional additive field `retrievalPlan`.

---

## Tradeoffs

- Slight orchestration complexity in `ContextService` vs implicit behavior.
- Rule-based adaptation only — no ML quality gains without external systems.
- P95 latency target: ≤ pre-6.5 +10% with default policy.

---

## Migration

1. No mandatory schema migration.
2. Ship default policy adapter behind env flag (default on after gate).
3. Document manifest field in ADR-025 when both approved.
4. Token benchmark regression tests (`benchmark:context-tokens`).

---

## Rollback

1. Set `RETRIEVAL_POLICY=legacy` or disable policy hook via env (implementation detail at gate).
2. Remove optional `retrievalPlan` from responses (additive — clients ignore).

---

## Impact on future phases

| Phase / track | Impact |
|---------------|--------|
| 5.5 Compression | Stage 1 prefers summary/canonical levels |
| 7.5 Capability manifest | Exposes policy version, default content mode |
| 8.5 Quality signals | Adjusts rule-based adaptive caps |
| 13–14 Scale | Vector/graph stages validated under load |
| Phase 7 MCP | Documents `content_mode`, `summary_only`, `max_chars` |

---

## References

- [.ai/phases/06.5-progressive-retrieval/DESIGN.md](../../.ai/phases/06.5-progressive-retrieval/DESIGN.md)
- [ADR-001](001-multi-source-retrieval.md)
- [.ai/phases/07-agent-runtime/DESIGN.md](../../.ai/phases/07-agent-runtime/DESIGN.md)
- [04-ARCHITECTURE.md](../../.ai/core/architecture/04-ARCHITECTURE.md)
- [POLICY.md](POLICY.md)
