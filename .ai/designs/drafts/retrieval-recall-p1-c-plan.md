# Blueprint: retrieval-recall-p1-c

| Field | Value |
|-------|-------|
| **Status** | Approved — Wave 3 complete |
| **Branch** | `forge/retrieval-recall-intelligence` |
| **Intent** | [retrieval-recall-p1-c-intent.md](./retrieval-recall-p1-c-intent.md) |
| **Isolate** | [retrieval-recall-p1-c-isolate.md](./retrieval-recall-p1-c-isolate.md) |
| **Baseline** | `org-memory-p1-b-complete` @ `c8eef9f` |
| **Evidence package** | `.ai/reviews/org-memory-dogfood/` |

---

## Execution progress

- [x] Wave 1 — Recall Contract Boundary
  - [x] Task 1 — recall contract package
  - [x] Task 2 — recall architecture ADR
  - [x] Task 3 — recall contract proof + service skeleton ports
- [x] Wave 2 — Candidate Retrieval Boundary
  - [x] Task 4 — SQL candidate provider adapter
  - [x] Task 5 — knowledge candidate provider adapter
  - [x] Task 6 — provider trace enrichment (orchestration remains ranking-free)
- [x] Wave 3 — Ranking Intelligence
  - [x] Task 7 — RecallPolicy ranking layer + auditable RecallDecision
- [ ] Wave 4 — Context Assembly Intelligence
- [ ] Wave 5 — Recall Evaluation Proof

---

## Problem statement

P1-B locked deterministic knowledge foundation (ingest → embed → store → index boundary).  
P1-A proved org-memory recall with a fixture harness, but recall intelligence is not yet expressed as a first-class Ratary domain contract with traceable decisions.

P1-C must add an intelligence layer **above** P1-B without mutating store/embedding/persistence contracts.

Core question:

> Can Ratary produce deterministic, explainable, tenant-safe recall outputs from a fixed knowledge state, with measurable quality and regression controls?

---

## Objectives

1. Introduce explicit recall contracts (`RecallRequest`, `RecallCandidate`, `RecallTrace`, `RecallResult`, `ContextPackage`).
2. Place recall orchestration in Ratary domain (`RecallService`, `CandidateProvider`, `RecallPolicy`).
3. Preserve P1-B foundation immutability and tenant isolation.
4. Produce evaluation artifacts for correctness, determinism, trace completeness, and isolation.
5. Close milestone with acceptance manifest + release lock tag `org-memory-p1-c-complete`.

---

## Scope

### In scope
- Recall domain contracts and service boundaries in Ratary.
- Candidate retrieval abstraction over existing memory/search boundaries.
- Ranking/relevance policy layer (wave 3+).
- Context assembly intelligence with source attribution.
- Deterministic recall evaluation harness and evidence artifacts.
- P1-C governance (ADR, acceptance, quality summary, release record).

### Out of scope (explicit non-goals)
- Vector DB migration or infrastructure replacement.
- Embedding model/provider tuning.
- P1-B storage redesign or schema mutation.
- Studio AI orchestration logic.
- Ontory agent runtime recall logic.
- Cross-tenant recall shortcuts.
- Marketplace/public API feature expansion unrelated to recall intelligence.

---

## 1. Current state reference

### Baseline lock
- Tag: `org-memory-p1-b-complete`
- Commit: `c8eef9f299a0c2ad38185af1785e87476cde0053`

### Existing Ratary recall-related components

| Component | Location | Role today |
|-----------|----------|------------|
| Memory retrieval | `src/memory/retriever.ts` | Candidate fetch via `IRetrievalCandidateSource` |
| Candidate source port | `src/memory/retrieval-candidate-source.interface.ts` | SQL/vector/graph candidate boundary |
| Ranking | `src/memory/ranker.ts`, `src/search/ranking.engine.ts` | Relevance scoring + boosts |
| Context assembly | `src/memory/context.service.ts`, `src/memory/context-builder.ts` | Build context string + scored memories |
| Retrieval policy | `src/memory/retrieval-policy/*` | Plan/budget hints for retrieval |
| MCP transport | `src/transport/mcp/mcp-server.ts` | `search_memory`, `get_context` tools |
| P1-B knowledge store | `scripts/lib/knowledge-store-boundary.ts` | Versioned persistence + index events |
| P1-B context consumer | `scripts/lib/knowledge-context-consumer.ts` | Organization-scoped context package from store snapshot |
| P1-A recall harness | `scripts/eval-org-memory-recall.ts` | Fixture-based pass/fail + metrics |

### Gap to close in P1-C
- No canonical `RecallRequest` / `RecallTrace` contract across MCP + domain.
- Candidate generation and policy decision are implicit inside `ContextService`.
- Evaluation harness does not yet assert trace completeness or candidate determinism at domain boundary.

---

## 2. Target P1-C architecture

```text
                 Consumer (Cursor / Studio / Ontory)
                            |
                         MCP/REST
                            |
                            v
                      RecallService
                     /      |       \
                    /       |        \
         CandidateProvider RecallPolicy RecallTrace
                    |
                    v
     Existing Search / Knowledge / Graph Boundaries
     (IRetrievalCandidateSource, knowledge store snapshot, graph expander)
                    |
                    v
              RecallResult + ContextPackage
```

### Placement rules
1. **Ratary domain layer** owns recall intelligence (`src/memory/recall/*`).
2. MCP/REST handlers only map transport DTOs ↔ recall contracts; no ranking logic in transport.
3. P1-B contracts remain read-only consumers via adapters, not modified schemas.
4. Existing `ContextService` remains compatible; P1-C introduces explicit recall path that can be adopted incrementally.

---

## 3. Contract design

### `RecallRequest`
- **Required:** `requestId`, `organizationId`, `query`, `traceContext`
- **Optional:** `workspaceId`, `projectId`, `filters`, `limit`, `tags`, `levels`, `freshnessPolicy`, `contextBudget`
- **Invariants:**
  - `organizationId` mandatory for all recall paths.
  - `traceContext` must include `sessionId` or `correlationId`.
  - `limit` bounded by deployment cap.

### `RecallCandidate`
- **Required:** `candidateId`, `organizationId`, `sourceType`, `sourceReference`, `signals`
- **Optional:** `documentId`, `versionId`, `chunkId`, `memoryId`, `metadata`, `confidence`
- **Invariants:**
  - candidate identity deterministic for same source artifact + version.
  - foreign-organization candidates are rejected before ranking.

### `CandidateSet`
- **Required:** `requestId`, `organizationId`, `candidates`, `generatedAt`
- **Optional:** `providerName`, `providerLatencyMs`, `truncated`
- **Invariants:**
  - stable ordering for same request + knowledge state.
  - `candidateCount` equals `candidates.length`.

### `RecallTrace`
- **Required:** `traceId`, `requestId`, `organizationId`, `candidateCount`, `decisionPath`, `startedAt`, `completedAt`
- **Optional:** `policyVersion`, `rankingVersion`, `warnings`
- **Invariants:**
  - every recall execution emits one trace.
  - `decisionPath` records stage transitions (`candidate_fetch`, `policy_filter`, `rank`, `assemble`).

### `RecallResult`
- **Required:** `requestId`, `traceId`, `organizationId`, `candidates`, `rankedCandidates`, `status`
- **Optional:** `missingSources`, `degradedMode`, `latencyMs`
- **Invariants:**
  - ranked output is explainable from `RecallTrace.decisionPath`.
  - `status` in `completed | partial | failed`.

### `RecallDecision` (planned — explainability layer)

- **Required:** `requestId`, `policyVersion`, `selectedCandidates`, `rejectedCandidates`, `decisionReason`, `confidenceSummary`
- **Optional:** `traceId`, `rankingVersion`
- **Role:** `RecallTrace` records what happened; `RecallDecision` records why the final outcome was chosen.
- **Wave plan:** contract defined in Wave 1; populated by `RecallPolicy` in Wave 3+.

### `ContextPackage` (P1-C recall-facing)
- **Required:** `requestId`, `traceId`, `organizationId`, `items`, `sourceAttribution`
- **Optional:** `tokenBudget`, `truncated`, `freshnessMetadata`
- **Invariants:**
  - each context item maps to one or more `RecallCandidate`.
  - source attribution includes `sourceReference` + `candidateId`.

### Service boundaries

| Service | Responsibility |
|---------|----------------|
| `CandidateProvider` | Produce `CandidateSet` from existing retrieval backends |
| `RecallPolicy` | Apply tenant-safe filtering/ranking rules and confidence metadata |
| `RecallService` | Orchestrate request → candidates → policy → result + trace |

---

## 4. Evaluation model

### Input
- fixed fixture corpus + query set (`.ai/reviews/org-memory-dogfood/fixtures/recall-fixture.json` baseline, P1-C extension for trace/candidate assertions)
- tenant/workspace context
- knowledge state snapshot reference (`ingestion_run_id` + store snapshot digest)

### Output
- ranked recall candidates
- `RecallTrace` per query
- comparable metrics artifact (`recall-intelligence-log.md`)

### Measured dimensions

| Dimension | Metric | Gate alignment |
|-----------|--------|----------------|
| Correctness | `pass_rate`, `successful_recalls`, `failed_recalls`, `missing_sources` | G4 |
| Determinism | `candidate_set_hash` stable across reruns | G1 |
| Trace completeness | `trace_complete_rate` (decisionPath stages present) | G3 |
| Isolation | `isolation_failures` (must be 0) | G2 |
| Performance | `avg_latency_ms`, `candidate_count` | advisory SLO (recorded, not hard-block v1) |
| Regression | delta vs previous run in quality summary | G5/G6 |
| Backward compatibility | existing `ContextService`, MCP tools, search API remain contract-compatible | G7 |

`candidate_set_hash` is a **mandatory** regression artifact for every harness run (detects behavior/determinism drift separately from quality score).

### Acceptance gates (P1-C)

| Gate | Focus | PASS criterion |
|------|-------|----------------|
| G1 | Recall pipeline execution | deterministic candidate flow for fixed fixture state |
| G2 | Organization isolation | zero cross-tenant candidate leakage |
| G3 | Trace completeness | 100% traces include full decision path |
| G4 | Recall correctness | fixture pass rate meets baseline threshold (no regression vs P1-A baseline) |
| G5 | Metrics reproducibility | official eval command regenerates identical schema |
| G6 | Regression & governance | `npm test`, `ci:org-memory-acceptance`, `ci:governance` green |
| G7 | Backward compatibility | existing `ContextService`, MCP consumers, and search API paths remain compatible unless ADR declares breaking change |

---

## 5. Wave architecture and invariants

### Wave 1 — Recall Contract Boundary
- Add recall contract schemas/types + validation tests.
- Document recall objective, relevance definition, context budget, freshness inheritance.
- No behavioral changes to MCP handlers yet.

### Wave 2 — Candidate Retrieval Boundary
- Implement `CandidateProvider` adapters over existing candidate sources.
- Providers return **raw candidates only** (fetch + tenant scoping; no ranking/scoring).
- All providers emit uniform `RecallCandidate.metadata` and `RecallTrace.providerTrace` (`provider`, `queryTimeMs`, `returned`, `filtered`, `candidateSetHash`).
- Providers must not invoke `RecallPolicy`; decision remains in orchestration.

### Wave 3 — Ranking Intelligence
- Implement `RecallPolicy` with relevance signals + confidence metadata.
- Deterministic ranking policy versioning in trace output.

### Wave 4 — Context Assembly Intelligence
- Build recall-facing `ContextPackage` assembly with source attribution and budget allocation.
- Bridge to existing context builder without breaking current `get_context` behavior.

### Wave 5 — Recall Evaluation Proof
- Extend harness for trace/determinism/isolation assertions.
- Produce `P1-C-ACCEPTANCE.md`, quality summary, and closeout evidence.

---

## Testing plan

### Unit
- contract schema validation (`RecallRequest`, `RecallCandidate`, `RecallTrace`)
- deterministic candidate ID generation
- policy decision path serialization
- tenant filter rejection for foreign candidates

### Integration
- RecallService end-to-end with fixture snapshot
- adapter compatibility with existing `IRetrievalCandidateSource`
- knowledge-store snapshot adapter parity with P1-B consumer boundary

### Acceptance
- G1–G6 gate evidence in `.ai/reviews/org-memory-dogfood/`
- `P1-C-ACCEPTANCE.md` manifest with PASS/BLOCK transparency

### Regression
- `npm test`
- `npm run ci:org-memory-acceptance`
- `npm run ci:governance`
- `npm run eval:recall-intelligence` (new official command in Wave 5)

---

## Task breakdown

## Task 1 — Add recall contract package (Wave 1)
- **Files:** `src/memory/recall/recall-contracts.ts`, `tests/recall/recall-contracts.test.ts`
- **Do:** define Zod/TS contracts for `RecallRequest`, `RecallCandidate`, `CandidateSet`, `RecallTrace`, `RecallResult`, `ContextPackage`; include validation helpers.
- **Verify:** `npm test -- tests/recall/recall-contracts.test.ts`
- **Done when:** contracts validate required/optional fields and invariants without touching P1-B schemas.

## Task 2 — Add recall architecture ADR (Wave 1)
- **Files:** `.ai/core/architecture/ADR-0006-recall-intelligence-boundary.md`, `.ai/core/architecture/README.md`
- **Do:** record Ratary-domain ownership, adapter strategy, and forbidden foundation mutations.
- **Verify:** `npm run ci:adr-impact`
- **Done when:** ADR accepted and indexed.

## Task 3 — Define recall policy + trace contract docs (Wave 1)
- **Files:** `.ai/designs/drafts/retrieval-recall-p1-c-plan.md`, `.ai/reviews/org-memory-dogfood/recall-contract-proof.md`
- **Do:** document relevance definition, context budget, freshness inheritance, and trace stage taxonomy.
- **Verify:** `rg "RecallTrace|decisionPath|contextBudget|freshness" .ai/designs/drafts/retrieval-recall-p1-c-plan.md .ai/reviews/org-memory-dogfood/recall-contract-proof.md`
- **Done when:** Wave 1 contract boundary is implementation-ready and evidence stub exists.

## Task 4 — Implement CandidateProvider port + SQL adapter (Wave 2)
- **Files:** `src/memory/recall/candidate-provider.port.ts`, `src/memory/recall/sql-candidate-provider.ts`, `tests/recall/sql-candidate-provider.test.ts`
- **Do:** wrap existing `IRetrievalCandidateSource` into `RecallCandidate` output with deterministic IDs.
- **Verify:** `npm test -- tests/recall/sql-candidate-provider.test.ts`
- **Done when:** provider returns tenant-scoped `CandidateSet` with stable ordering.

## Task 5 — Implement knowledge-store CandidateProvider adapter (Wave 2)
- **Files:** `src/memory/recall/knowledge-candidate-provider.ts`, `tests/recall/knowledge-candidate-provider.test.ts`
- **Do:** map P1-B store snapshot to recall candidates without modifying store contracts.
- **Verify:** `npm test -- tests/recall/knowledge-candidate-provider.test.ts`
- **Done when:** adapter reads snapshot only and enforces organization filter.

## Task 6 — Implement RecallService orchestration skeleton (Wave 2)
- **Files:** `src/memory/recall/recall-service.ts`, `src/memory/recall/recall-trace.ts`, `tests/recall/recall-service.test.ts`
- **Do:** orchestrate request → provider → trace shell → `RecallResult` (ranking deferred to Wave 3).
- **Verify:** `npm test -- tests/recall/recall-service.test.ts`
- **Done when:** service emits one trace per request with candidate stage recorded.

## Task 7 — Implement RecallPolicy ranking layer (Wave 3)
- **Files:** `src/memory/recall/recall-policy.ts`, `src/memory/recall/recall-policy.port.ts`, `tests/recall/recall-policy.test.ts`
- **Do:** add deterministic policy signals, confidence metadata, and ranked output semantics.
- **Verify:** `npm test -- tests/recall/recall-policy.test.ts`
- **Done when:** same fixture input yields stable ranked order and policy version in trace.

## Task 8 — Implement context assembly intelligence (Wave 4)
- **Files:** `src/memory/recall/context-package-assembler.ts`, `src/memory/recall/context-budget.ts`, `tests/recall/context-package-assembler.test.ts`
- **Do:** assemble recall-facing `ContextPackage` with source attribution and token budget rules.
- **Verify:** `npm test -- tests/recall/context-package-assembler.test.ts`
- **Done when:** each context item links to candidate + source reference and respects budget cap.

## Task 9 — Wire recall path behind existing MCP/REST boundary (Wave 4)
- **Files:** `src/memory/context.service.ts`, `src/transport/mcp/mcp-server.ts`, `tests/identity/mcp-scope-recall.test.ts`
- **Do:** map transport requests to `RecallService` without breaking existing tool contracts.
- **Verify:** `npm test -- tests/identity/mcp-scope-recall.test.ts`
- **Done when:** MCP recall path remains tenant-safe and backward compatible.

## Task 10 — Build recall evaluation harness + metrics (Wave 5)
- **Files:** `scripts/eval-recall-intelligence.ts`, `.ai/reviews/org-memory-dogfood/fixtures/recall-intelligence-fixture.json`, `.ai/reviews/org-memory-dogfood/recall-intelligence-log.md`, `package.json`
- **Do:** add deterministic harness for correctness, determinism hash, trace completeness, isolation metrics.
- **Verify:** `npm run eval:recall-intelligence`
- **Done when:** harness writes comparable run artifact with required metric schema.

## Task 11 — Produce P1-C acceptance + quality summary (Wave 5)
- **Files:** `.ai/reviews/org-memory-dogfood/P1-C-ACCEPTANCE.md`, `.ai/reviews/org-memory-dogfood/P1-C-QUALITY-SUMMARY.md`, `scripts/ci/recall-intelligence-acceptance-check.mjs`
- **Do:** consolidate G1–G6 evidence, risks, and reproducibility checks.
- **Verify:** `npm run ci:recall-intelligence-acceptance && npm run ci:governance`
- **Done when:** acceptance manifest is audit-ready with explicit PASS/BLOCK per gate.

## Task 12 — Closeout governance + release record (Wave 5)
- **Files:** `.ai/governance/releases/P1-C-RECALL-INTELLIGENCE.md`, `.ai/governance/releases/README.md`, `.ai/phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md`, `.ai/sessions/CURRENT.md`
- **Do:** finalize milestone status and prepare lock tag `org-memory-p1-c-complete` (governance-only closeout commit).
- **Verify:** `rg "P1-C|recall-intelligence|org-memory-p1-c-complete" .ai/governance/releases/*.md .ai/sessions/CURRENT.md`
- **Done when:** release trail explains P1-C state without implicit context.

---

## Dependencies

- Task 1 before Tasks 4–8 (contracts first).
- Task 2 before Task 6 (architecture decision before orchestration wiring).
- Task 4 and Task 5 before Task 6.
- Task 6 before Task 7.
- Task 7 before Task 8.
- Task 8 before Task 9.
- Task 9 before Task 10.
- Task 10 before Task 11.
- Task 11 before Task 12 closeout.

## Parallelizable groups

- **Group A (parallel):** Task 2 and Task 3 after Task 1.
- **Group B (parallel):** Task 4 and Task 5 after Task 1.
- **Group C (parallel):** Task 11 documentation refresh can start after Task 10 first green run.
- **Sequential gate:** no Wave 3+ implementation before Wave 2 service skeleton is green.

---

## Exit criteria (blueprint stage)

- [x] Current state and baseline reference documented.
- [x] Target architecture and ownership boundaries documented.
- [x] Contract fields/invariants defined.
- [x] Evaluation model and G1–G6 gates defined.
- [x] Explicit non-goals documented.
- [x] Task list includes exact file paths and verification commands.
- [x] ADR task included for architecture traceability.

Owner approval required before `forge-execute` Wave 1.

**Owner approval:** ✅ granted — Wave 1 execute unlocked.
