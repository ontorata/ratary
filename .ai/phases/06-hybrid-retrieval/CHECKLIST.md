# Phase 6 — Hybrid Retrieval — CHECKLIST

**Document:** CHECKLIST  
**Phase status:** Active  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Template:** [review/01-PHASE-CHECKLIST.md](../../review/01-PHASE-CHECKLIST.md)

---

## Purpose

Executable gate checklist instance — one item per Phase 6 milestone or success criterion.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Phase open (Readiness PASS) from review checklist template |
| **Updated by** | Assistant during phase; owner signs at gate |
| **Read-only when** | Phase gate PASS — frozen snapshot |
| **Roadmap relation** | Each item traces to milestone or success criterion |

---

## Milestones

- [ ] ADR-001 Approved
- [ ] `CompositeRetrievalCandidateSource` + tests
- [ ] `VectorRetrievalCandidateSource` via `IEmbeddingStore.searchSimilar`
- [ ] Wire composite at composition root (`HYBRID_RETRIEVAL` flag)
- [ ] Fusion weights in ranking config (if in scope)
- [ ] TASK_PROMPT Phase 6 from template
- [ ] No Retriever / ContextService rewrite

## Success criteria

- [ ] Semantic recall improves on fixture set (measurable)
- [ ] `Retriever` and MCP tools unchanged
- [ ] Dedupe by `memoryId`, cap after merge
- [ ] Owner-scoped vector candidates
- [ ] Quality gate green; regression suite pass

## Quality gate

- [ ] `npm run lint && npm run format:check && npm run typecheck && npm test` — green
- [ ] [08-REVIEW-CHECKLIST.md](../../../standards/08-REVIEW.md) satisfied
- [ ] ARCHITECTURE.md Phase 6 row updated
- [ ] ADR-001 marked Implemented

---

*Owner signs at phase gate. Do not self-approve.*
