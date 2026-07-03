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

- [x] ADR-001 Approved
- [x] `CompositeRetrievalCandidateSource` + tests
- [x] `VectorRetrievalCandidateSource` via `IEmbeddingStore.searchSimilar`
- [x] Wire composite at composition root (`HYBRID_RETRIEVAL` flag)
- [x] Fusion weights in ranking config (if in scope)
- [x] TASK_PROMPT Phase 6 from template
- [x] No Retriever / ContextService rewrite

## Success criteria

- [x] Semantic recall improves on fixture set (measurable)
- [x] `Retriever` and MCP tools unchanged
- [x] Dedupe by `memoryId`, cap after merge
- [x] Owner-scoped vector candidates
- [x] Quality gate green; regression suite pass

## Quality gate

- [x] `npm run lint && npm run format:check && npm run typecheck && npm test` — green (192 tests passed)
- [x] [08-REVIEW-CHECKLIST.md](../../core/standards/08-REVIEW.md) satisfied — **All gates passed**
- [x] ARCHITECTURE.md Phase 6 row updated
- [x] ADR-001 marked Implemented

---

*Owner signs at phase gate. Do not self-approve.*
