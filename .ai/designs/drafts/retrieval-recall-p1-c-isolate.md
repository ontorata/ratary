# P1-C Retrieval / Recall Intelligence — Forge Isolate

| Field | Value |
|-------|-------|
| **Branch** | `forge/retrieval-recall-intelligence` |
| **Baseline tag** | `org-memory-p1-b-complete` |
| **Tag object** | `960e1427eb17d4c2e18f2ffee5b1165fe1b9c0f7` |
| **Baseline commit** | `c8eef9f299a0c2ad38185af1785e87476cde0053` |
| **Intent** | [retrieval-recall-p1-c-intent.md](./retrieval-recall-p1-c-intent.md) |
| **Verification timestamp** | `2026-07-08T14:26:01.3990445+07:00` |
| **Status** | ✅ Isolate active — ready for blueprint |

---

## Pre-flight checklist

- [x] Baseline locked to `org-memory-p1-b-complete`
- [x] P1-C intent drafted as single source of truth
- [x] Allowed changes declared
- [x] Forbidden changes declared
- [x] Wave structure defined
- [x] Acceptance philosophy defined

---

## Change boundary (allowed in P1-C)

1. Recall domain contracts and service boundaries in Ratary domain/application layers.
2. Candidate retrieval abstraction and recall response packaging.
3. Ranking/relevance policy layer and confidence metadata.
4. Context assembly intelligence and context budget rules.
5. Evaluation harness artifacts for retrieval/recall quality.
6. P1-C governance artifacts under `.ai/designs`, `.ai/reviews`, `.ai/phases`, `.ai/sessions`, and release records.

---

## Explicit no-touch boundary (P1-C constitutional lock)

1. P1-B knowledge store contract
2. P1-B embedding lifecycle contract
3. Persistence model and versioning semantics
4. Tenant isolation and auth model
5. MCP transport contract
6. Existing memory CRUD contract
7. Studio ownership boundary
8. Ontory runtime ownership

---

## Baseline verification (must pass before implementation)

| Command | Result |
|---------|--------|
| `npm test` | ✅ PASS — 27 files / 111 tests |
| `npm run ci:org-memory-acceptance` | ✅ PASS |
| `npm run ci:governance` | ✅ PASS |

---

## Risks and assumptions

### Risks
1. Retrieval logic may drift into client layers (Studio/Ontory) if boundary not enforced.
2. Ranking policy changes may reduce determinism without harness controls.
3. Context assembly may optimize for output quality while breaking traceability.

### Assumptions
1. P1-C implements intelligence above locked P1-B foundation, not schema refactors.
2. Evaluation harness is authoritative for recall quality acceptance.
3. Tenant-bound recall behavior remains mandatory for all candidate/context flows.

---

## Exit criteria (isolate -> blueprint)

- [x] Baseline provenance recorded (tag object + commit + timestamp)
- [x] Boundary and no-touch rules documented
- [x] Baseline verification green and recorded
- [x] No implementation code changes for P1-C yet

**Ready for forge-blueprint:** ✅ proceed.
