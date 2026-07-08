# ADR-0006 — Recall Intelligence Boundary

| Field | Value |
|-------|-------|
| **Status** | Accepted — P1-C execution baseline |
| **Date** | 2026-07-08 |
| **Baseline** | `org-memory-p1-b-complete` @ `c8eef9f` |
| **Related** | ADR-0005 · P1-C Retrieval/Recall Intent/Blueprint |

---

## Context

P1-B locked deterministic knowledge foundation (ingest → embed → store → index boundary).  
P1-A proved org-memory recall with fixture harness, but recall intelligence is not yet expressed as a first-class Ratary domain contract.

Without explicit recall boundary:
- retrieval logic can drift into Studio/Ontory clients;
- candidate generation and ranking decisions become hard to audit;
- regression and determinism checks cannot be enforced consistently.

---

## Decision

Ratary introduces a recall intelligence layer in the **Ratary domain** (`src/memory/recall/*`) above existing search/knowledge/graph boundaries.

### Locked architectural decisions

1. **Ownership:** Recall intelligence belongs to Ratary domain, not Studio/Ontory/MCP transport.
2. **Separation:** Candidate generation (`CandidateProvider`) is separated from ranking (`RecallPolicy`).
3. **Separation:** Context assembly is separated from retrieval candidate generation.
4. **Determinism:** Evaluation harness must prove traceable, explainable, and reproducible recall behavior (`candidate_set_hash` mandatory).

### Service flow

```text
RecallRequest
  -> CandidateProvider (candidates)
  -> RecallPolicy (ranking + RecallDecision) [Wave 3+]
  -> RecallService orchestration
  -> RecallResult + RecallTrace (+ ContextPackage in Wave 4)
```

### Contracts (Wave 1 baseline)

- `RecallRequest`, `RecallCandidate`, `CandidateSet`, `RecallTrace`, `RecallDecision`, `RecallResult`, `ContextPackage`
- MCP/REST remain transport adapters; they must not own ranking logic.

### Compatibility rule (G7)

Changes to recall orchestration must preserve compatibility for:
- existing `ContextService` consumers,
- existing MCP tools (`search_memory`, `get_context`),
- existing search API contracts,

unless an ADR explicitly declares a breaking change.

---

## Why Ratary-domain recall intelligence

1. Single recall behavior across all AI consumers.
2. Tenant-safe traceability and evidence linkage.
3. Measurable regression controls independent from client UX layers.
4. Clean evolution path from P1-B knowledge foundation without schema mutation.

---

## Alternatives considered

### Alternative A — Client-side retrieval in Studio/Ontory
Pros: faster per-client experimentation.  
Cons: duplicated logic, inconsistent quality, boundary violations.

### Alternative B — Ratary-domain recall intelligence (chosen)
Pros: shared contracts, auditability, deterministic harness, tenant isolation preserved.  
Cons: requires disciplined wave execution and compatibility gates.

### Alternative C — Immediate ranking optimization before contracts
Pros: short-term quality gains.  
Cons: unstable foundation, poor regression governance.

---

## Consequences

### Positive
- Explainable recall via `RecallTrace` + `RecallDecision`.
- Deterministic regression artifact (`candidate_set_hash`).
- Clear adapter path over existing `IRetrievalCandidateSource` and P1-B store snapshot.

### Negative / trade-offs
- Additional orchestration layer before visible quality gains in Wave 1.
- Compatibility gate (G7) adds verification overhead for MCP/REST integration waves.

---

## Non-goals (P1-C)

- P1-B store schema or embedding lifecycle changes.
- Vector infrastructure migration/tuning.
- Studio/Ontory recall runtime ownership.
- Cross-tenant recall shortcuts.

---

## Evidence expectations

- Wave 1: contract tests + ADR + service skeleton trace emission.
- Wave 5: recall intelligence harness with G1–G7 acceptance manifest.
