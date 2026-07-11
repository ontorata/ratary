# P1-C Wave 4 — Context Assembly Boundary Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Wave** | 4 — Context Assembly Intelligence |
| **Baseline** | `org-memory-p1-b-complete` + Wave 3 Ranking |
| **HEAD reference** | `forge/retrieval-recall-intelligence` |

---

## Locked boundary

```text
RecallDecision + rankedCandidates
        │
        ▼
ContextAssembler
        │
        ▼
ContextPackage
```

**Invariant:** Context assembly packages already-selected recall output. It must not fetch, score, or re-rank candidates.

---

## Guardrails verified

| Guardrail | Status | Evidence |
|-----------|--------|----------|
| No provider / SQL / embedding access | ✅ | Assembler only maps local arrays |
| No ranking mutation | ✅ | Order preserved from Wave 3 `rankedCandidates` |
| Input limited to `selectedCandidates` | ✅ | Assembler filters by decision IDs |
| Token budget enforcement | ✅ | `context-budget.ts` + truncation fields |
| Provenance preserved | ✅ | `sourceRecallDecisionId`, `policyVersion`, `provenance` |

---

## ContextPackage contract

| Field | Role |
|-------|------|
| `packageId` | Unique package identity |
| `generatedAt` | Assembly timestamp |
| `sourceRecallDecisionId` | Deterministic link to Wave 3 decision |
| `policyVersion` | Ranking policy used |
| `items[]` | Budget-fitted context units |
| `tokenUsage` | budget / used / remaining |
| `truncation` | omitted candidates + count |
| `provenance` | audit metadata (`rankingOrderPreserved`) |

---

## Files delivered

| Path | Role |
|------|------|
| `src/memory/recall/context-budget.ts` | Token budget allocation (order-preserving) |
| `src/memory/recall/context-package-assembler.ts` | Decision → ContextPackage |
| `src/memory/recall/recall-contracts.ts` | Extended ContextPackage + RecallResult.contextPackage |
| `src/memory/recall/recall-service.ts` | Wire assemble stage into orchestration |
| `tests/recall/context-package-assembler.test.ts` | Budget, provenance, selection boundary |

---

## Trace stage update

```text
decisionPath: ['candidate_fetch', 'policy_filter', 'rank', 'assemble']
```

---

## Verification

| Command | Result |
|---------|--------|
| `npm test -- tests/recall` | PASS (32 tests) |
| `npm test` | PASS |

---

## Next gate

Wave 5 — Recall Evaluation Proof (harness metrics + acceptance).
