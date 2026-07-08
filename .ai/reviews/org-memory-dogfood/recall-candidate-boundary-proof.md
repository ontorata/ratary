# P1-C Wave 2 — Candidate Retrieval Boundary Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-C Retrieval / Recall Intelligence |
| **Wave** | 2 — Candidate Retrieval Boundary |
| **Baseline** | `org-memory-p1-b-complete` |

---

## Wave 2 boundary rules (locked)

1. **Raw candidates only** — providers perform fetch + tenant scoping, not ranking/scoring/reranking.
2. **Uniform metadata** — every `RecallCandidate.metadata` uses the shared schema (`source`, `sourceId`, `contentType`, `organizationId`, timestamps, `permissions`, `embeddingVersion`, `tokenCount`, `provenance`).
3. **Provider trace enrichment** — `RecallTrace.providerTrace` records `provider`, `queryTimeMs`, `returned`, `filtered`, `candidateSetHash`.
4. **Policy ignorance** — providers do not import or invoke `RecallPolicy`; decision remains in orchestration (Wave 3+).

---

## Providers delivered

| Provider | Path | Backend |
|----------|------|---------|
| SQL | `src/memory/recall/sql-candidate-provider.ts` | `IRetrievalCandidateSource` |
| Knowledge | `src/memory/recall/knowledge-candidate-provider.ts` | P1-B knowledge store snapshot reader |

---

## Invariants verified

| Invariant | Evidence |
|-----------|----------|
| Empty `signals` on raw fetch | provider unit tests |
| Foreign organization filtered | SQL + knowledge tests |
| Deterministic candidate ordering | `sortCandidatesDeterministically` |
| `candidate_set_hash` emitted in trace | `RecallProviderTrace` schema + trace builder |
| No policy coupling in providers | port boundary only (`ICandidateProvider`) |

---

## Verification

| Command | Result |
|---------|--------|
| `npm test -- tests/recall` | PASS |
| `npm test` | PASS (124 tests) |

---

## Next gate

Wave 3 — Ranking Intelligence (`RecallPolicy` implementation, no provider changes).
