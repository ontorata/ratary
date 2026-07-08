# P1-B Knowledge Ingestion — Forge Intent
**Status:** Approved — ready for forge-isolate
**Slug:** knowledge-ingestion-p1-b-intent
**Baseline:** `org-memory-p1-a-complete`
**Phase:** 04-proof-of-platform
**Category:** Must Prove / Must Enable

---

## Problem

P1-A proved that organizational memory recall can be audited and closed with reproducible evidence.  
P1-B must prove ingestion quality at workload scale, not just ingestion execution.

Current risk:
- ingestion may run, but quality controls (idempotency, deduplication, metadata integrity, version trace) can drift as source volume increases;
- evidence can become partial if ingestion lifecycle and observability are not normalized from day one;
- organization isolation must stay strict while ingestion surface expands.

Success question for P1-B:

> Can Ratary run deterministic, organization-safe, evidence-complete ingestion that remains reproducible across commits and ready for recall quality growth in P1-C?

---

## Constraints (constitution / ADR / governance)

1. P0 baselines remain frozen under `P0-BASELINE-CHANGE-POLICY.md`.
2. P1-B starts from locked baseline `org-memory-p1-a-complete`; all comparisons are against this baseline.
3. Repository + `.ai/` remain source of truth; Ratary is semantic memory layer.
4. Evidence-first execution is mandatory: implementation is incomplete without docs + evidence synchronization.
5. Organization isolation cannot regress (tenant boundaries and authorization contracts stay intact).
6. Acceptance gates and metrics must be executable from official scripts (no manual-only validation).

---

## Decision

Run P1-B as a new milestone with explicit ingestion lifecycle and measurable quality gates.

Scope pillars:
1. Source support model (what sources are supported now and why).
2. Ingestion lifecycle state model.
3. Idempotency + deduplication contract.
4. Metadata + versioning integrity.
5. Observability and failure/retry traceability.
6. Organization-safe ingestion boundaries.

Execution policy:
- keep the P1-A structure: Intent -> Isolate -> Blueprint -> Execute -> Acceptance -> Quality Summary -> Release Record -> Governance Closeout -> Baseline Tag;
- require deterministic artifacts for every stage.

Owner decisions (2026-07-08):
- Minimum viable source set: Core + Governance + Release + Session handoff.
- Retry policy: max 2 retries with light exponential backoff.
- End-to-end latency metric: state transition events as canonical source.
- Organization scope for closeout: single-org (Ontorata) in P1-B.

---

## In-Scope (P1-B)

1. Define supported source classes and boundaries.
2. Define ingestion state transitions and canonical run schema.
3. Add idempotency and deduplication invariants with measurable counters.
4. Normalize metadata and versioning contract for ingestable artifacts.
5. Add failure modes + retry strategy + evidence linkage.
6. Produce reproducible metrics and acceptance gate evidence.
7. Prove organization isolation for ingestion pipeline operations.

---

## Explicit Out-of-Scope (P1-B)

1. Retrieval ranking redesign (belongs to P1-C).
2. New AI workspace UX flows (belongs to P1-D+).
3. Complex knowledge graph modeling and orchestration features.
4. Public marketplace integration changes.
5. P0 baseline architecture changes outside allowed policy exceptions.

---

## Metrics Model (from day one)

### Pipeline
- `ingestion_requests`
- `ingestion_success`
- `ingestion_failed`
- `ingestion_latency_ms`
- `retry_count`

### Quality
- `duplicate_documents`
- `skipped_documents`
- `invalid_documents`
- `normalized_documents`
- `ingestion_coverage_pct`
- `deduplication_ratio`
- `normalization_success_rate`

### Evidence
- `evidence_created`
- `evidence_missing`
- `trace_complete`
- `evidence_completeness_rate`

### Organization
- `organizations_processed`
- `documents_per_org`
- `isolation_failures`

### End-to-end
- `ingest_to_recall_ready_latency_ms`

---

## Acceptance Gates (initial P1-B)

| Gate | Focus | Definition (initial) |
|------|-------|----------------------|
| G1 | Pipeline execution | Ingestion lifecycle runs deterministically with reproducible success/failure counters |
| G2 | Organization isolation | No cross-organization ingestion leakage; isolation checks pass |
| G3 | Metadata integrity | Required metadata/version fields are complete and valid |
| G4 | Evidence completeness | End-to-end trace from ingestion request to persisted evidence is complete |
| G5 | Metrics reproducibility | Official commands regenerate the same metric schema and comparable snapshots |
| G6 | Regression & governance | Baseline tests and governance checks remain green with synchronized docs |

---

## Alternatives considered

### Alternative A — Extend P1-A scripts ad-hoc
Pros: faster short-term coding.  
Cons: blurry milestone boundaries, harder audit, weak baseline comparison.

### Alternative B — New P1-B milestone from locked baseline (chosen)
Pros: clear change boundary, reproducible comparisons, cleaner governance closeout.  
Cons: requires up-front intent/blueprint discipline.

### Alternative C — Jump directly to retrieval/context (P1-C)
Pros: visible feature progress.  
Cons: ingestion quality debt compounds and weakens recall trust.

---

## Impact (layers, ports, tests)

Likely impacted areas:
- ingestion scripts and shared ingestion library contracts;
- evidence/metrics artifacts under `.ai/reviews/`;
- governance docs for acceptance, quality summary, and release records;
- CI checks for ingestion acceptance non-regression.

Validation expectations:
- deterministic ingestion tests and contract checks;
- organization isolation tests for ingestion path;
- reproducible metrics/acceptance commands;
- full baseline test suite remains green.

---

## Definition of Done (P1-B)

P1-B is complete only if all three layers pass:

1. Technical: ingestion pipeline is stable and deterministic.
2. Operational: metrics and evidence are reproducible via official commands.
3. Governance: acceptance + quality summary + release record + baseline tag are complete and synchronized.

---

## Open questions

1. Should we add hard SLO thresholds in P1-B, or keep thresholding informational and enforce in P1-C?
2. Which failure classes should be auto-retriable versus fail-fast in Wave 1?
