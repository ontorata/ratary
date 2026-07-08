# ADR-0005 — Knowledge Ingestion Pipeline

| Field | Value |
|-------|-------|
| **Status** | Accepted — P1-B execution baseline |
| **Date** | 2026-07-08 |
| **Baseline** | `org-memory-p1-a-complete` @ `f52b0be` |
| **Related** | ADR-0001 · ADR-0002 · P1-B Knowledge Ingestion Intent/Blueprint |

---

## Context

P1-A closed with reproducible recall and evidence chain, but ingestion quality semantics remain partially implicit.  
P1-B requires ingestion architecture that is deterministic, resumable, and audit-ready under growing source volume.

Without explicit staged contracts:
- idempotency and deduplication behavior can drift;
- retries and crashes can create inconsistent persistence;
- evidence and metrics reproducibility can degrade.

---

## Decision

Ratary knowledge ingestion uses a staged pipeline with explicit boundaries:

1. Source intake
2. Normalization
3. Chunk building
4. Embedding generation
5. Knowledge store persist
6. Index update

Core rules:
- normalization and chunk persistence are atomic per document version;
- embedding and index stages are resumable/replayable;
- each stage emits canonical identifiers for trace continuity;
- retry is bounded (max 2 retries, light exponential backoff);
- idempotency is digest/version based to prevent duplicate persistent effects.

---

## Why staged pipeline

1. Improves observability and evidence traceability by stage.
2. Limits blast radius of failures and supports targeted replay.
3. Preserves deterministic behavior for CI and governance proofs.
4. Enables controlled evolution for P1-C retrieval quality work.

---

## Alternatives considered

### Alternative A — Single monolithic ingest transaction
Pros: simpler initial code path.  
Cons: weak failure isolation, hard replay, poor evidence granularity.

### Alternative B — Staged pipeline with explicit boundaries (chosen)
Pros: strong auditability, replay safety, cleaner metrics, future scalability.  
Cons: higher initial design complexity.

### Alternative C — Async event-first pipeline from day one
Pros: scale-ready architecture.  
Cons: too much operational complexity for P1-B scope.

---

## Consequences

### Positive
- Deterministic ingestion behavior aligned with evidence-first governance.
- Better incident diagnosis through stage-level metrics and logs.
- Clear bridge to P1-C without hidden ingestion debt.

### Trade-offs
- More contract maintenance overhead.
- Requires stricter schema/version discipline in scripts and evidence artifacts.

---

## Non-goals

- Retrieval ranking redesign.
- Multi-organization production rollout in P1-B.
- Marketplace/public API ingestion expansion.

---

## Compliance and evidence

Required for closeout:
- `npm test` green baseline.
- `npm run ci:org-memory-acceptance` green.
- `npm run ci:governance` green.
- Updated evidence artifacts under `.ai/reviews/org-memory-dogfood/`.

Any significant change to stage boundaries, retry rules, or persistence semantics requires ADR update or superseding ADR.
