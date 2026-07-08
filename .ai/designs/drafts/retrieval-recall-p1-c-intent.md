# P1-C Retrieval / Recall Intelligence — Forge Intent
**Status:** Draft — pending owner approval
**Slug:** retrieval-recall-p1-c-intent
**Baseline:** `org-memory-p1-b-complete`
**Branch:** `forge/retrieval-recall-intelligence`
**Phase:** 04-proof-of-platform
**Category:** Must Prove / Must Enable

---

## Problem

P1-B successfully locked deterministic memory foundation: ingestion, embedding lifecycle, versioned store, index boundary, and end-to-end proof.  
What is still missing is the **intelligence layer** that converts stored knowledge into high-quality, explainable, and measurable recall outputs for AI consumers.

Current risk without P1-C:
- retrieval behavior can drift across consumers (Studio/Ontory/other clients),
- recall quality lacks a dedicated contract and evaluation harness,
- context package quality cannot be improved safely without a Ratary-native intelligence boundary.

Core question:

> Can Ratary produce deterministic, explainable, tenant-safe recall outputs from a fixed knowledge state, with measurable quality and regression controls?

---

## Constraints (constitution / ADR / governance)

1. P1-C must start from immutable baseline `org-memory-p1-b-complete`.
2. Retrieval intelligence must live in **Ratary domain layer**, not Studio/Ontory client layer.
3. Studio remains operator/control plane; Ontory remains consumer/product layer.
4. P1-C must not mutate P1-B foundation contracts unless approved via ADR/intent revision.
5. Evaluation harness is mandatory from early stage; no subjective “looks better” acceptance.
6. Tenant isolation, identity boundary, and MCP transport contracts remain authoritative.

---

## Allowed changes (P1-C)

1. Introduce recall contracts:
   - `RecallRequest`
   - `CandidateSet`
   - `RecallResult`
   - `ContextPackage`
2. Add retrieval pipeline abstraction inside Ratary:
   - Search provider boundary -> Recall engine -> Context assembly
3. Add ranking/relevance policy layer (P1-C waves 3+).
4. Add deterministic recall evaluation harness:
   - benchmark query set
   - expected evidence mapping
   - regression comparison outputs
5. Add metrics and evidence artifacts for recall quality and latency.

---

## Forbidden changes (P1-C)

DO NOT CHANGE:
- P1-B knowledge store contract
- embedding lifecycle contract
- persistence model and versioning semantics
- tenant isolation and auth model
- MCP transport contract
- existing memory CRUD contract
- Studio ownership boundary
- Ontory runtime ownership

DO NOT INTRODUCE:
- retrieval logic inside Studio/Ontory clients
- vector DB tuning as first-class P1-C requirement
- cross-tenant recall shortcuts

---

## Decision

Execute P1-C as an intelligence layer **above** the locked memory foundation.

Pattern to enforce:

```text
Client
  ->
MCP / REST
  ->
Ratary Recall Intelligence
  ->
Context Package
  ->
Any AI Consumer
```

This preserves single-source recall logic, consistent traceability, and tenant-safe behavior across all consumers.

---

## Alternatives considered

### Alternative A — Client-side retrieval logic in Studio/Ontory
Pros: fast per-client experimentation.  
Cons: duplicated logic, inconsistent quality, boundary violations.

### Alternative B — Ratary-only recall intelligence (chosen)
Pros: consistent contracts, shared evaluation, clean ownership boundaries.  
Cons: requires stricter design discipline and harness-first workflow.

### Alternative C — Immediate ranking optimization before contracts
Pros: visible short-term quality gains.  
Cons: unstable foundation, difficult regression governance.

---

## Impact (layers, ports, tests)

Likely impacted:
- Ratary recall domain modules and context assembly pathways.
- Recall-specific API/MCP handler contracts (without breaking existing transport contract).
- Evaluation and evidence artifacts under `.ai/reviews/org-memory-dogfood/`.
- Governance docs for acceptance/quality/release closeout.

Validation expectations:
- deterministic candidate/recall tests,
- tenant isolation recall tests,
- regression harness outputs with comparable metrics,
- existing acceptance guard and core tests remain green.

---

## P1-C wave structure (proposed)

### Wave 1 — Recall Intent Contract
- define recall objective, relevance definition, context budget, freshness policy, tenant inheritance.

### Wave 2 — Candidate Retrieval Boundary
- implement `RecallService`, `RecallRequest`, `RecallResponse`, `CandidateSet` (no complex ranking).

### Wave 3 — Ranking Intelligence
- add relevance signals, confidence model, ranking policy.

### Wave 4 — Context Assembly Intelligence
- implement context budget allocation, memory prioritization, source attribution metadata.

### Wave 5 — Recall Evaluation Proof
- benchmark queries, regression comparison, quality + latency evidence.

---

## Acceptance philosophy

P1-C is successful when, for fixed tenant/query/knowledge state, Ratary produces:
- deterministic candidate set,
- explainable recall decision,
- traceable context package,
- measurable quality with regression deltas.

---

## Open questions

1. Should P1-C enforce hard SLO thresholds now or record them as advisory for initial lock?
2. Which relevance metric set is canonical for closeout: precision@k, recall@k, or workload-aligned pass gates?
3. How many benchmark queries are minimum viable for first P1-C lock without overfitting?
