# P1-C Wave 5 — Recall Evaluation Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Wave** | 5 — Recall Evaluation Proof |
| **Baseline** | `org-memory-p1-b-complete` |
| **Harness** | `npm run eval:recall-intelligence` |

---

## Measurement boundary

```text
RecallRequest + Fixed Fixture
        │
        ▼
Recall Evaluation Harness
        │
        ▼
Metrics + Ranking Comparison Log
```

Wave 5 adds **no new intelligence**. It proves Wave 3 ranking decisions are measurable and regressible.

---

## Dataset reference

- Fixture: `.ai/reviews/org-memory-dogfood/fixtures/recall-intelligence-fixture.json`
- `fixture_version=p1c-recall-intelligence-v1`
- `policy_version=1.0.0`
- Organization scope: `org-ontorata` + isolation probe `org-foreign`

---

## Query cases

| Query ID | Gate | Focus |
|----------|------|-------|
| `q-mangrove-migration` | G4 | Expected ranking order vs `RecallDecision` |
| `q-isolation` | G2 | Tenant leakage must be zero |
| `q-determinism-repeat` | G1 | Same input → same decision hash |

---

## Example ranking comparison

**Query:** `project mangrove migration decision`

**Expected order:**
1. `cand-adr-0001`
2. `cand-migration-policy`

**Actual order (policy v1.0.0):**
1. `cand-adr-0001`
2. `cand-migration-policy`

`cand-meeting-notes` rejected by limit/ranking boundary as expected.

---

## Metrics (latest run)

| Metric | Value |
|--------|-------|
| run_id | `9f331b05-71d0-4207-8fcb-949523bfcbb2` |
| query_count | 3 |
| pass_rate | 100.00% |
| avg_top_k_precision | 1.0000 |
| ordering_correct_rate | 100.00% |
| isolation_failures | 0 |
| trace_complete_rate | 100.00% |
| candidate_set_hash | `1b820fd835c10c45` |

---

## Regression result

- Deterministic reruns produce identical `decision_hash` per query.
- Policy version recorded in evaluation log for version comparison.
- Acceptance manifest: `P1-C-ACCEPTANCE.md` (G1–G7 PASS).

---

## Verification

| Command | Result |
|---------|--------|
| `npm run eval:recall-intelligence` | PASS |
| `npm run ci:recall-intelligence-acceptance` | PASS |
| `npm test` | PASS |

---

## Next gate

Milestone closeout (release record + tag `org-memory-p1-c-complete`) — blueprint Task 12.
