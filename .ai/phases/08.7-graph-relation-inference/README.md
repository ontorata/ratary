# Phase 8.7 — Automatic Graph Relation Inference

**Status:** ✅ Implemented (2026-07-04) · ADR-041 Accepted  
**Capability:** Async inference of `memory_relations` edges from project, tags, temporal proximity — `source_type=inferred`. **Manual relations never overwritten.**

**Flag:** `RELATION_INFERENCE_ENABLED=false` (default)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Architecture, ports, invariants |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy and evidence |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist — all tracks ✅ |

**ADR:** [ADR-041](../../../docs/adr/041-automatic-graph-relation-inference.md)

---

## Quick start

```bash
# Enable in .env
RELATION_INFERENCE_ENABLED=true
RELATION_INFERENCE_STORE_PROVIDER=sql

# Dry-run — reports candidates, no mutations
npm run infer:relations

# Execute — upserts inferred relations + evidence audit
npm run infer:relations:execute

# Scoped run
npm run infer:relations -- --owner=<ownerId> --project=ai-brain
```

Manifest reports `capabilities.supportsRelationInference: true` when flag enabled.

---

## Inference sources (deterministic)

| Source | Signal | Relation type |
|--------|--------|---------------|
| `project` | Same project / projectId | `related` |
| `shared_tag` | Overlapping tags | `related` |
| `temporal` | Created within 7 days | `related` |

Deferred: semantic similarity (embeddings), conversation, dependency extraction.

---

## Related

- Phase 8 Knowledge Graph: [08-knowledge-graph](../08-knowledge-graph/README.md)
- Phase 04.7 graph-repair task (future): [04.7-memory-stewardship](../04.7-memory-stewardship/README.md)
