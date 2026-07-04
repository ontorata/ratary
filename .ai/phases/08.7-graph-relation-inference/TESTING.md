# Phase 8.7 — Graph Relation Inference — TESTING

**Status:** Implemented (2026-07-04)

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/inference/relation-scoring-policy.test.ts` | Merge, min confidence filter |
| `tests/inference/project-cooccurrence-source.test.ts` | Same-project edges |
| `tests/inference/relation-inference-orchestrator.test.ts` | Dry-run vs execute |
| `tests/repositories/memory-relation.repository.test.ts` | upsertInferred create/update/skip |
| `tests/composition/relation-inference-ports.test.ts` | Composition env gating |
| `tests/db/extension-tracks-migration.test.ts` | `relation_inference_evidence` table |
| `tests/capabilities/manifest-builder.test.ts` | `supportsRelationInference` |

---

## Scenarios verified

- [x] Project co-occurrence produces `related` candidate
- [x] Scoring merges duplicate edges, filters low confidence
- [x] Orchestrator dry-run does not upsert
- [x] Orchestrator execute calls upsertInferred
- [x] Manual relation → `skipped_manual`
- [x] Existing inferred → `updated`
- [x] New inferred → `created` with `source_type=inferred`
- [x] Migration creates evidence table
- [x] Flag off → ports disabled

---

## Manual verification

```bash
RELATION_INFERENCE_ENABLED=true RELATION_INFERENCE_STORE_PROVIDER=sql npm run infer:relations
RELATION_INFERENCE_ENABLED=true npm run infer:relations:execute
```

---

## Deferred tests

- [ ] Shared tag + temporal source unit tests
- [ ] Graph traverse includes inferred edges E2E
- [ ] Semantic similarity source (embedding-based)
