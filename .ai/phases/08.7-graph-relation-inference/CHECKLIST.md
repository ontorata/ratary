# Phase 8.7 — Graph Relation Inference — CHECKLIST

**Phase status:** ✅ Implemented (2026-07-04) · ADR-041 Accepted  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-041](../../adr/041-automatic-graph-relation-inference.md)

---

## Implementation tracks

- [x] **8.7A** — Port interfaces + types
- [x] **8.7B** — Three deterministic inference sources
- [x] **8.7C** — Scoring policy + orchestrator
- [x] **8.7D** — `upsertInferred` (manual-safe)
- [x] **8.7E** — Evidence store + migration
- [x] **8.7F** — CLI + composition + manifest
- [x] **8.7G** — Tests + docs

---

## Testing

- [x] Scoring policy tests
- [x] Source + orchestrator tests
- [x] Repository upsertInferred tests
- [x] Composition + migration tests

---

## Documentation

- [x] DESIGN.md, README.md, IMPLEMENTATION.md, TESTING.md, CHECKLIST.md
- [x] ADR-041 — Accepted with implementation section
- [x] `04-ARCHITECTURE.md` — relation inference section
- [x] `phases/README.md` — index entry

---

## Constitution boundary

- [x] No LLM relation extraction
- [x] No hot-path inference on CRUD
- [x] Manual relations immutable to inference jobs

---

## Deferred

- [x] Semantic similarity inference source (`SemanticSimilaritySource`)
- [x] Phase 04.7 `graph-repair` stewardship task — `GraphRepairTask` in `create-memory-stewardship-ports`
- [x] Conversation / dependency sources (`ConversationCooccurrenceSource`, `DependencySource`)

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — Implemented 2026-07-04 |
| **ADR** | ADR-041 Accepted |
