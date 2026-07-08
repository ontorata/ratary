# P1-C Wave 3 — Recall Policy Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Wave** | 3 — Ranking Intelligence |
| **Baseline** | `org-memory-p1-b-complete` |
| **Commit** | Wave 3 implementation |

---

## What was delivered

### Files added
- `src/memory/recall/recall-policy.ts` — `RecallPolicy` implementation
- `tests/recall/recall-policy.test.ts` — 14 unit tests

### Files modified
- `src/memory/recall/recall-service.ts` — wired `IRecallPolicy` into orchestration
- `src/memory/recall/recall-trace.ts` — added `policyVersion` to trace options
- `tests/recall/recall-service.test.ts` — updated to use policy-aware stub

---

## RecallPolicy — deterministic ranking layer

**Class:** `RecallPolicy` implements `IRecallPolicy`
**Version:** `1.0.0`

### Ranking signals

| Signal | Weight | Description |
|--------|--------|-------------|
| `confidence` | 0–1000 | Candidate confidence (0–1 normalized); default 0.5 when absent |
| `recency` | 0–500 | Age-based recency: `max(0, 500 - ageDays × 2)` |
| `embedding presence` | +200 | Candidate has `metadata.embeddingVersion` set |

Score = `(confidence ?? 0.5) × 1000 + recency + (embeddingVersion ? 200 : 0)`

**Tiebreak:** `candidateId.localeCompare` — stable and deterministic.

### Filters applied before ranking

| Filter | Field checked | Behavior |
|--------|--------------|----------|
| `tags[]` | `candidate.metadata.source` | Include only matching sources |
| `levels[]` | `candidate.metadata.contentType` | Include only matching content types |
| `freshnessPolicy` | `candidate.metadata.updatedAt` | `max_age:Nh` / `max_age:Nd` — reject candidates older than cutoff |

### RecallDecision population

Every call to `applyPolicy` produces a `RecallDecision`:
- `selectedCandidates` — `candidateId[]` of ranked+limited output
- `rejectedCandidates` — `candidateId[]` of filter-rejected + limit-overflowed
- `decisionReason` — human-readable summary of counts and filters applied
- `confidenceSummary` — `high` / `medium` / `low` band based on average confidence

---

## Trace integration

`RecallService.recall()` now calls `applyPolicy` and records the policy stage in the trace:

```
decisionPath: ['candidate_fetch', 'policy_filter', 'rank']
policyVersion: '1.0.0'
```

`RecallDecision` is surfaced in `RecallResult.decision`.

---

## Test coverage (14 tests)

| Group | Cases |
|-------|-------|
| **Determinism** | Same input → same order across calls; tiebreak stable |
| **Ranking** | confidence ordering; embedding signal; recency signal; limit cap |
| **Filtering** | tag filter; level filter; freshness hours; freshness days |
| **RecallDecision** | selected/rejected population; confidence band; filter-rejected always in rejected |
| **Boundary** | Input CandidateSet not mutated |

---

## Validation

```
npm test -- tests/recall --reporter=verbose
✓ 27/27 recall tests PASS
✓ 138/138 full suite PASS
```

No P1-B store schema mutations. No ranking in providers. No MCP transport changes.

---

## Backward compatibility (G7)

- `RecallService` constructor now requires a second `IRecallPolicy` argument — existing callers must supply a policy.
- `ContextService`, MCP `search_memory`/`get_context`, and search API paths are **not modified** in this wave.
- `RecallDecision` is optional on `RecallResult` — existing consumers that don't inspect it are unaffected.

---

## Next — Wave 4 Context Assembly Intelligence

- `ContextPackage` assembly with token budget and source attribution
- Bridge to existing `ContextService` without breaking `get_context` behavior
