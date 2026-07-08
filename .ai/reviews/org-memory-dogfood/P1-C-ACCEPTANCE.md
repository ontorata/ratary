# P1-C Acceptance Manifest — Recall Intelligence

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Scope** | Contracts · Retrieval · Ranking · Context · Evaluation |
| **Branch** | `forge/retrieval-recall-intelligence` |
| **Baseline** | `org-memory-p1-b-complete` |
| **Status** | CLOSED (G1–G7 PASS · baseline locked) |
| **Closeout tag** | `org-memory-p1-c-complete` |
| **Primary reference** | This file is the single acceptance source of truth |

---

## Acceptance gates (G1–G7)

| Gate | Status | Notes |
|------|--------|-------|
| G1 | PASS | Deterministic recall pipeline on fixed fixture |
| G2 | PASS | Organization isolation — `isolation_failures=0` |
| G3 | PASS | Trace + decision + context package completeness |
| G4 | PASS | Ranking order matches expected top-k on fixture |
| G5 | PASS | Metrics reproducible via `npm run eval:recall-intelligence` |
| G6 | PASS | Regression suite green (`npm test`, governance guards) |
| G7 | PASS | No MCP/ContextService contract break in Wave 5 scope |

---

## Evidence references

- Wave 1: [`recall-contract-proof.md`](./recall-contract-proof.md)
- Wave 2: [`recall-candidate-boundary-proof.md`](./recall-candidate-boundary-proof.md)
- Wave 3: [`recall-ranking-boundary-proof.md`](./recall-ranking-boundary-proof.md) · [`recall-policy-proof.md`](./recall-policy-proof.md)
- Wave 4: [`context-assembly-boundary-proof.md`](./context-assembly-boundary-proof.md)
- Wave 5: [`recall-evaluation-proof.md`](./recall-evaluation-proof.md) · [`recall-intelligence-log.md`](./recall-intelligence-log.md)
- Fixture: [`fixtures/recall-intelligence-fixture.json`](./fixtures/recall-intelligence-fixture.json)
- Quality rollup: [`P1-C-QUALITY-SUMMARY.md`](./P1-C-QUALITY-SUMMARY.md)

---

## Metrics snapshot (latest eval)

- `run_id=9f331b05-71d0-4207-8fcb-949523bfcbb2`
- `fixture_version=p1c-recall-intelligence-v1`
- `policy_version=1.0.0`
- `query_count=3`
- `pass_rate=100.00%`
- `avg_top_k_precision=1.0000`
- `ordering_correct_rate=100.00%`
- `isolation_failures=0`
- `trace_complete_rate=100.00%`
- `candidate_set_hash=1b820fd835c10c45`

---

## Risks and known limitations

1. Evaluation fixture size is intentionally small (`query_count=3`) for deterministic regression baseline.
2. MCP bridge wiring (blueprint Task 9) deferred to preserve G7; RecallService path is proven in-domain.
3. Ranking signals are policy-local (confidence/recency/embedding presence), not semantic embedding similarity.

---

## Exit criteria checklist (P1-C Wave 5)

- [x] Waves 1–5 evidence artifacts present
- [x] G1–G7 PASS in this manifest
- [x] `npm run eval:recall-intelligence` reproducible
- [x] `npm test` green
- [x] Ranking order regression captured in evaluation log
- [x] No provider/ranking boundary regression introduced in Wave 5

---

## Reviewer sign-off

- [x] Engineering review
- [x] Governance review
