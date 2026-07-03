# Task Prompt — Phase 7 Agent Runtime (boundary)

**Status:** 🔲 Active — documentation & boundary work only.  
**Template:** [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md)

**Before coding:** [core/ai-rules/11-AI-RULES.md](core/ai-rules/11-AI-RULES.md) · [core/architecture/04-ARCHITECTURE.md](core/architecture/04-ARCHITECTURE.md) · [workflow/05-WORKFLOW.md](workflow/05-WORKFLOW.md)

---

# TASK

Prepare **Phase 7 — Agent Runtime** boundary: agent loops and orchestration stay **outside** this repository. Document MCP/REST integration contracts for external agent runtimes. No planner, executor, or reasoning engine inside `src/`.

---

## Requirements

- Agent runtime ADR drafted or linked (external system scope)
- MCP tool contracts verified stable for agent consumers
- Phase 7 folder docs aligned with [phases/roadmap/09-ROADMAP.md](phases/roadmap/09-ROADMAP.md)
- Update [core/architecture/10-PHASE-STATUS.md](core/architecture/10-PHASE-STATUS.md) when gate criteria met
- Quality gate: `npm run lint && npm run format:check && npm run typecheck && npm test`

### ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [001](../docs/adr/001-multi-source-retrieval.md) | Hybrid retrieval | **Implemented** |
| [002](../docs/adr/002-workspace-identity-model.md) | Workspace identity | **Approved** |

### Out of scope

- Agent planning / execution loops in `src/`
- New MCP tools unless required for stable agent boundary (owner approval)

---

## Constraints

- Follow [core/ai-rules/11-AI-RULES.md](core/ai-rules/11-AI-RULES.md)
- Extend existing modules — no `*V2` parallel implementations
- REST and MCP share application services
- One concern per commit

---

## Definition of Done

- [ ] Phase 7 milestones in roadmap checked with evidence
- [ ] External agent integration documented (human + AI refs)
- [ ] `10-PHASE-STATUS.md` and `09-ROADMAP.md` consistent
- [ ] All quality gates pass
- [ ] No constitution violations per [core/standards/08-REVIEW.md](core/standards/08-REVIEW.md)

---

*Rotate from [workflow/12-TASK-TEMPLATE.md](workflow/12-TASK-TEMPLATE.md) when Phase 7 completes.*
