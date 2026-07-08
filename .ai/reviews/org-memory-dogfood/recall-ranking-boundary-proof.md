# P1-C Wave 3 — Recall Ranking Boundary Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Wave** | 3 — Ranking Intelligence |
| **Baseline** | `org-memory-p1-b-complete` |
| **Related** | [recall-policy-proof.md](./recall-policy-proof.md) |

---

## Locked boundary

```text
CandidateProvider  →  CandidateSet (raw)
                            │
                            ▼
                     RecallPolicy.evaluate()
                            │
                            ▼
                     RecallDecision (immutable output)
                            │
                            ├── selectedCandidates
                            ├── rejectedCandidates
                            ├── candidateOutcomes (score + reasons)
                            ├── policyExecution
                            └── policyVersion
```

**Invariant:** `RecallPolicy` consumes candidates only. It must not fetch SQL, embeddings, or permissions.

---

## Policy input / output

| Concern | Contract |
|---------|----------|
| Input | `RecallRequest` + `CandidateSet` |
| Ranking output | `rankedCandidates: RecallCandidate[]` |
| Decision output | `RecallDecision` with `candidateOutcomes` + `policyExecution` |
| Trace stages | `candidate_fetch` → `policy_filter` → `rank` |

---

## Ranking invariants

1. Same `CandidateSet` + same request filters → same ordered decision (stable sort + `candidateId` tiebreak).
2. Policy version is recorded (`policyVersion = 1.0.0`, `policyName = confidence-recency-embedding`).
3. Input `CandidateSet.candidates` is never mutated.
4. Providers are never invoked from policy code.
5. Tenant isolation remains upstream (provider scoping); policy filters on request metadata only.

---

## Score calculation boundary

| Signal | Contribution |
|--------|--------------|
| confidence | `(confidence ?? 0.5) × 1000` |
| recency | `max(0, 500 - ageDays × 2)` |
| embedding presence | `+200` if `metadata.embeddingVersion` set |

Each candidate outcome records reason/weight/contribution for audit and regression.

---

## Decision trace sample

```json
{
  "policyVersion": "1.0.0",
  "selectedCandidates": ["c1"],
  "rejectedCandidates": ["c2"],
  "candidateOutcomes": [
    {
      "candidateId": "c1",
      "outcome": "selected",
      "score": 1400,
      "reasons": [
        { "reason": "tag_match:sql", "weight": 0, "contribution": 0 },
        { "reason": "confidence", "weight": 1, "contribution": 900 },
        { "reason": "recency", "weight": 1, "contribution": 500 }
      ]
    },
    {
      "candidateId": "c2",
      "outcome": "rejected_filter",
      "score": 0,
      "reasons": [{ "reason": "tag_filter:knowledge", "weight": 0, "contribution": 0 }]
    }
  ],
  "policyExecution": {
    "policyName": "confidence-recency-embedding",
    "candidatesScored": 2,
    "candidatesSelected": 1,
    "primaryReason": "confidence"
  }
}
```

---

## Verification

| Command | Expected |
|---------|----------|
| `npm test -- tests/recall` | PASS |
| `npm test` | PASS |

---

## Next gate

Wave 4 — Context Assembly Intelligence (`ContextPackage`, budget, source attribution).
