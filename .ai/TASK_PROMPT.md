# Task Prompt — Phase 8 Knowledge Graph

**Status:** 🔲 Active — ADR gate then implementation.  
**Template:** [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md)

**Before coding:** [core/ai-rules/11-AI-RULES.md](core/ai-rules/11-AI-RULES.md) · [core/architecture/04-ARCHITECTURE.md](core/architecture/04-ARCHITECTURE.md) · [workflow/05-WORKFLOW.md](workflow/05-WORKFLOW.md)

---

# TASK

Implement **Phase 8 — Knowledge Graph**: `IGraphProvider` port, graph-augmented retrieval candidate source, and composite wiring — without replacing flat `memory_relations` CRUD.

---

## Requirements

- `IGraphProvider` ADR drafted and **Approved** before implementation
- Graph retrieval candidate source via existing `IRetrievalCandidateSource` pattern
- Extend `CompositeRetrievalCandidateSource` (third leg) — no Retriever rewrite
- Phase 8 folder docs aligned with [phases/roadmap/09-ROADMAP.md](phases/roadmap/09-ROADMAP.md)
- Update [core/architecture/10-PHASE-STATUS.md](core/architecture/10-PHASE-STATUS.md) when gate criteria met
- Quality gate: `npm run lint && npm run format:check && npm run typecheck && npm test`

### ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [001](../docs/adr/001-multi-source-retrieval.md) | Hybrid retrieval | **Implemented** |
| [002](../docs/adr/002-workspace-identity-model.md) | Workspace identity | **Approved** |
| [006](../docs/adr/006-igraph-provider.md) | Graph provider port | **Approved** |

### Out of scope

- `MemoryRelationRepositoryV2` or relation schema rewrite
- Graph SQL inside `MemoryRepository`
- Agent planning / execution (Phase 7 boundary — external)

---

## Constraints

- Follow [core/ai-rules/11-AI-RULES.md](core/ai-rules/11-AI-RULES.md)
- Extend existing modules — no `*V2` parallel implementations
- REST and MCP share application services
- One concern per commit

---

## Definition of Done

- [x] [ADR-006](../docs/adr/006-igraph-provider.md) IGraphProvider Approved (2026-07-03)
- [ ] Graph retrieval source + unit tests
- [ ] Composite wiring with env gate (if applicable)
- [ ] `10-PHASE-STATUS.md` and `09-ROADMAP.md` consistent
- [ ] All quality gates pass
- [ ] No constitution violations per [core/standards/08-REVIEW.md](core/standards/08-REVIEW.md)

---

*Rotated from Phase 7 completion (2026-07-03). Design: [phases/08-knowledge-graph/DESIGN.md](phases/08-knowledge-graph/DESIGN.md). ADR draft: [docs/adr/006-igraph-provider.md](../docs/adr/006-igraph-provider.md).*
