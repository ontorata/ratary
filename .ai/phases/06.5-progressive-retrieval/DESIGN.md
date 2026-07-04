# Phase 6.5 — Progressive Retrieval — DESIGN

**Document:** DESIGN  
**Phase status:** Ready (Architecture Review approved 2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Roadmap placement:** Track extends Phase 4 + Phase 6; production hardening in **Phase 13–14**  
**ADR gate (draft):** [ADR-024](../../../docs/adr/024-progressive-retrieval-policy.md) — **Proposed**

---

## Purpose

Formalize **progressive retrieval** — a staged, budget-aware pipeline that fetches cheap memory projections first and hydrates expensive fields (full body, graph hops, vector seeds) only when policy and budget allow.

Phase 6.5 **codifies existing behavior** and adds explicit policy ports:

| Already implemented | Phase 6.5 formalizes |
|---------------------|----------------------|
| O-04-2: retrieval projection strips `content` | Stage 0: metadata |
| `generateSummary` + summary in candidates | Stage 1: summary |
| `findByIdsWithContent` on `content_mode=full` | Stage 2: body hydration |
| `CompositeRetrievalCandidateSource` | Stages 3–5: relation / vector / graph legs |
| `max_chars`, `limit`, `content_mode` | `IRetrievalBudget` + `IRetrievalPolicy` |

Phase 6.5 does **not** rewrite `Retriever`, `Ranker`, or `MemoryService`. `ContextService` gains policy coordination only.

---

## Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| `IRetrievalPolicy` port | New |
| `IRetrievalBudget` types | New |
| `RetrievalStage` enum | New |
| `RetrievalPlan` (pure) | New |
| Extend `ContextService.buildContext` | Policy hook before `ContextBuilder` |
| Default policy adapter | Matches current production behavior |
| Policy version in response metadata | Additive |

### Outside this repository

| Capability | Location |
|------------|----------|
| Agent multi-hop “decide next fetch” | External runtime |
| ML-based adaptive retrieval | External experimentation |

### Non-goals

- `RetrieverV2` / `ContextServiceV2`
- Unbounded multi-round retrieval loops
- Changing MCP tool names or required parameters
- Merging REST search with LLM context pipeline

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         ContextService.buildContext                       │
│  1. Retriever.retrieve (candidates — no body)                             │
│  2. Ranker.rank (pure)                                                    │
│  3. IRetrievalPolicy.resolve(plan)  ← NEW                                 │
│  4. [optional] hydrate bodies / expand graph per plan                     │
│  5. ContextBuilder.build(budget)                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         CompositeRetrievalCandidateSource    IRetrievalBudget
         (SQL · Vector · Graph legs)          maxChars · maxMemories
                                              allowBody · allowGraph
```

### Progressive stage model

| Stage | Name | Source | Default |
|-------|------|--------|---------|
| 0 | **Metadata** | `findRetrievalCandidates` projection | Always |
| 1 | **Summary** | `summary` field on candidate | Always in context |
| 2 | **Body** | `findByIdsWithContent` | Off (MCP `content_mode=summary`) |
| 3 | **Relations** | Flat relations / neighbor IDs | Off in context assembly |
| 4 | **Vector** | `VectorRetrievalCandidateSource` | Env: `HYBRID_RETRIEVAL` |
| 5 | **Graph** | `GraphRetrievalCandidateSource` | Env: `GRAPH_RETRIEVAL` |

**Note:** Stage 5 traversal for deep BFS remains **`traverse_relations` MCP tool** — not auto-inlined into every `get_context` call.

### Design invariants

1. **Single ranking path** — `Ranker` runs once per request; stages affect hydration not scoring order.
2. **Budget is hard cap** — `ContextBuilder` enforces `max_chars` regardless of policy.
3. **404 cross-scope** — policy cannot widen scope.
4. **Default = current behavior** — with `RETRIEVAL_POLICY=default`, production matches pre-6.5.
5. **Pure policy** — `IRetrievalPolicy` has no I/O.

---

## Boundary

| Inside Phase 6.5 | Outside |
|------------------|---------|
| Stage ordering and budget gates | Agent planning |
| Rule-based adaptive caps (importance, access_count) | Online model training |
| Token estimate integration (`token-estimate.ts`) | External RAG orchestrator |
| Documented retrieval plan in response | Hidden recursive fetches |

**Constitution §32:** Context efficiency — progressive retrieval is the enforcement mechanism.

---

## Data Flow

```
Client: get_context { query, limit, max_chars, content_mode }
  │
  ▼
MemoryScope resolved (IScopeResolver)
  │
  ▼
Retriever → SQL [+ Vector if enabled] [+ Graph seeds if enabled]
  │         (content column empty — O-04-2)
  ▼
Ranker → ScoredMemory[] (top N)
  │
  ▼
IRetrievalPolicy.resolve(request, budget)
  │   returns RetrievalPlan {
  │     stagesApplied: ['metadata','summary'],
  │     hydrateBody: content_mode === 'full',
  │     maxMemories, maxChars
  │   }
  ▼
[if hydrateBody] findByIdsWithContent(ids, scope)
  │
  ▼
ContextBuilder.build(memories, { maxChars, includeSummaryOnly })
  │
  ▼
Response { context, memories[], retrievalPlan?, totalCandidates }
```

### REST search (unchanged)

`SearchService` / `GET /api/v1/memory/search` — **not** progressive; paginated full rows per existing contract.

---

## Module Structure

```
src/
  memory/
    retrieval-policy/
      retrieval-stage.ts           # enum + types
      retrieval-budget.ts          # IRetrievalBudget
      iretrieval-policy.interface.ts
      default-retrieval-policy.ts  # pure — mirrors current behavior
    context.service.ts             # extend — policy hook only
    token-estimate.ts              # existing — used by budget manager
  types/
    context.ts                     # additive BuildContextBody fields optional
```

---

## Interfaces

```typescript
type RetrievalStage =
  | 'metadata'
  | 'summary'
  | 'body'
  | 'relations'
  | 'vector'
  | 'graph';

interface IRetrievalBudget {
  maxChars: number;
  maxMemories: number;
  maxGraphDepth?: number;
  allowBodyHydration: boolean;
  allowGraphExpansion: boolean;
}

interface RetrievalPlan {
  policyVersion: string;
  stagesApplied: RetrievalStage[];
  hydrateBody: boolean;
  budget: IRetrievalBudget;
}

interface IRetrievalPolicy {
  resolve(
    request: BuildContextRequest,
    rankedCount: number,
    deployment: RetrievalDeploymentCapabilities,
  ): RetrievalPlan;
}

interface RetrievalDeploymentCapabilities {
  hybridRetrieval: boolean;
  graphRetrieval: boolean;
  maxContextMaxChars: number;
}
```

### Default policy rules (mirrors current)

| Input | Plan |
|-------|------|
| `context.includeSummaryOnly !== false` (default true) | Stages 0–1; `hydrateBody=false` |
| `content_mode=full` / `includeSummaryOnly=false` | Stages 0–2; hydrate body |
| `HYBRID_RETRIEVAL=true` | Enable vector leg in Retriever (unchanged wiring) |
| `GRAPH_RETRIEVAL=true` | Enable graph seed leg (unchanged wiring) |
| `max_chars` < 2000 | Reduce effective `maxMemories` proportionally |

### Adaptive retrieval (rule-based, optional track)

| Signal | Adjustment |
|--------|------------|
| High `importance` | Allow +1 memory within budget |
| High `access_count` | Prefer summary-only even if full requested when budget tight |
| Low candidate count | Skip hydration |

**No ML.** Signals are columns already on `memories`.

---

## Storage Impact

**No schema migration required** for core Phase 6.5.

Optional additive:

| Column / table | Purpose |
|----------------|---------|
| — | None mandatory |

Response may include `retrievalPlan` JSON (computed, not persisted).

---

## API Impact

| Method | Endpoint | Change |
|--------|----------|--------|
| `POST` | `/api/v1/context` | Optional response field `retrievalPlan` |
| `POST` | `/api/v1/context` body | Optional `context.policy` string (default policy id) |
| All others | — | Unchanged |

Existing fields `context.maxChars`, `context.includeSummaryOnly` **retained**.

---

## MCP Impact

| Tool | Change |
|------|--------|
| `get_context` | Optional response `retrievalPlan`; existing params unchanged |
| `build_prompt` | Inherits via `buildContext` |
| All others | Unchanged |

| Param | Status |
|-------|--------|
| `content_mode` | `summary` \| `full` — maps to hydration stage |
| `summary_only` | Maps to `includeSummaryOnly` |
| `max_chars`, `limit` | Budget inputs |

Env:

| Env | Default | Purpose |
|-----|---------|---------|
| `RETRIEVAL_POLICY` | `default` | Policy adapter id |
| `RETRIEVAL_POLICY_VERSION` | `1` | Manifest + debugging |

---

## Testing

| Test | Purpose |
|------|---------|
| `default-retrieval-policy.test.ts` | Pure policy tables |
| `context.service.test.ts` extend | hydrate vs summary-only unchanged semantics |
| `token-benchmark.test.ts` | ≥85% summary path savings |
| `cross-owner-leak.test.ts` | Policy cannot expand scope |
| E2E MCP | `content_mode=full` includes body marker; default excludes |
| Composite regression | ADR-001 merge unchanged when policy default |

**Performance gate:** P95 `buildContext` latency ≤ pre-6.5 +10% with default policy.

---

## Success Criteria

- [ ] ADR-024 **Approved**
- [ ] `IRetrievalPolicy` + default adapter behind env flag
- [ ] Default policy reproduces current production behavior exactly
- [ ] `retrievalPlan` optional in REST/MCP responses when enabled
- [ ] Token benchmark thresholds documented and CI-stable
- [ ] No signature changes to `MemoryService`, `Retriever`, `Ranker`
- [ ] O-04-2 regression test still passes
- [ ] All existing tests green with `RETRIEVAL_POLICY=default`

---

## Future Phase

| Phase | Interaction |
|-------|-------------|
| **5.5** | Policy prefers `level=summary\|canonical` candidates |
| **7.5** | Manifest advertises `supportsProgressiveRetrieval`, policy version |
| **8.5** | Quality signals adjust rule-based adaptive caps |
| **13** | pgvector / R2 stages validated under load |
| **14** | Meilisearch / Neo4j as optional high stages |

---

## References

| Document | Relevance |
|----------|-----------|
| [ADR-001](../../../docs/adr/001-multi-source-retrieval.md) | Composite retrieval |
| [ADR-024](../../../docs/adr/024-progressive-retrieval-policy.md) | Gate (Proposed) |
| [Phase 4 DESIGN](../04-memory-intelligence/DESIGN.md) | Retriever, ContextBuilder |
| [Phase 6 DESIGN](../06-hybrid-retrieval/DESIGN.md) | Vector leg |
| [Phase 8 DESIGN](../08-knowledge-graph/DESIGN.md) | Graph leg |
| [Phase 7 DESIGN §10–§11](../07-agent-runtime/DESIGN.md) | Context MCP contract |
| `src/memory/context.service.ts` | Orchestration point |
| `src/repositories/memory.repository.ts` | O-04-2 projection |
| Architecture Review 2026-07-04 | Progressive stack approval |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Implementation deferred until ADR-024 Approved.*
