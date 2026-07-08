# P1-C Wave 1 — Recall Contract Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Wave** | 1 — Recall Contract Boundary |
| **Baseline** | `org-memory-p1-b-complete` |
| **ADR** | [ADR-0006-recall-intelligence-boundary.md](../../core/architecture/ADR-0006-recall-intelligence-boundary.md) |

---

## Contract boundary summary

| Contract | Purpose |
|----------|---------|
| `RecallRequest` | Tenant-scoped recall input with mandatory trace context |
| `RecallCandidate` | Candidate artifact considered for recall |
| `CandidateSet` | Deterministic candidate collection for a request |
| `RecallTrace` | Stage-level execution trace (`decisionPath`) |
| `RecallDecision` | Explainability record for final candidate selection |
| `RecallResult` | Orchestrated recall output |
| `ContextPackage` | Recall-facing assembled context with attribution |

---

## Relevance definition (Wave 1)

Initial relevance is expressed through `RecallCandidate.signals` and policy version metadata.  
Wave 3 introduces ranking policy semantics; Wave 1 only defines contract shape and trace taxonomy.

---

## Context budget inheritance

`RecallRequest.contextBudget` is optional and consumed by context assembly in Wave 4.  
When absent, assembly uses deployment default budget without mutating request contracts.

---

## Freshness policy inheritance

`RecallRequest.freshnessPolicy` is optional metadata passed through recall orchestration.  
Policy interpretation is deferred to `RecallPolicy` (Wave 3) and context assembly (Wave 4).

---

## Trace stage taxonomy

1. `candidate_fetch`
2. `policy_filter`
3. `rank`
4. `assemble`

Wave 1 skeleton emits `candidate_fetch` only.

---

## Regression artifact requirement

Every recall harness run must emit `candidate_set_hash` to distinguish:
- quality changes,
- behavior changes,
- determinism drift.

---

## Wave 1 verification

| Check | Command | Expected |
|-------|---------|----------|
| Contract schema tests | `npm test -- tests/recall/recall-contracts.test.ts` | PASS |
| Service skeleton trace | `npm test -- tests/recall/recall-service.test.ts` | PASS |
| ADR registry | `npm run ci:adr-impact` | PASS |
