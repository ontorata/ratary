# Phase 8.7 — Graph Relation Inference — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-041 Accepted](../../adr/041-automatic-graph-relation-inference.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Orchestrator | `RelationInferenceOrchestrator` | ✅ |
| Sources | project, shared_tag, temporal | ✅ |
| Scoring | `DefaultRelationScoringPolicy` — merge + min confidence | ✅ |
| Persistence | `upsertInferred` on relation repository | ✅ |
| Evidence | `SqlRelationEvidenceStore` + migration | ✅ |
| CLI | `infer:relations` (dry-run default) | ✅ |
| Composition | `create-relation-inference-ports.ts` | ✅ |
| Manifest | `supportsRelationInference` | ✅ |

---

## File map

```
src/inference/
  relation-inference.types.ts
  relation-inference.constants.ts
  relation-inference-orchestrator.ts
  default-relation-scoring-policy.ts
  sources/project-cooccurrence-source.ts
  sources/shared-tag-source.ts
  sources/temporal-proximity-source.ts
  index.ts
src/infrastructure/inference/
  sql-relation-evidence-store.ts
src/composition/create-relation-inference-ports.ts
src/repositories/memory-relation.repository.ts   # upsertInferred
scripts/infer-relations.ts
tests/inference/
tests/composition/relation-inference-ports.test.ts
tests/repositories/memory-relation.repository.test.ts
```

---

## Wiring

```typescript
createRelationInferencePorts(sql, env) → { enabled, orchestrator }

CLI:
  npm run infer:relations [-- --execute] [--owner=] [--project=]

Persistence:
  upsertInferred → insert source_type=inferred | update inferred | skip manual
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `RELATION_INFERENCE_ENABLED` | `false` | Master switch |
| `RELATION_INFERENCE_STORE_PROVIDER` | `none` | `sql` \| `none` — evidence audit |

---

## Non-regression

- Manual relation CRUD unchanged
- Graph traversal reads same `memory_relations` table
- No inference when flag disabled

---

## Rollback

Set `RELATION_INFERENCE_ENABLED=false`; inferred edges remain in DB but no new jobs run.
