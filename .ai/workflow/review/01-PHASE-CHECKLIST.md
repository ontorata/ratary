# Phase Checklist

**Purpose:** Verifiable pass/fail items for every phase lifecycle stage.  
**Audience:** AI assistants and reviewers.  
**Normative keywords:** RFC 2119.

**Use with:** [00-PHASE-GATE.md](00-PHASE-GATE.md) · [02-PHASE-SCORECARD.md](02-PHASE-SCORECARD.md)

---

## Lifecycle map

| Stage | Checklist section |
|-------|-------------------|
| Design | §1 |
| Implementation | §2 |
| Tests | §3 |
| Architecture Review | §4 |
| Phase Gate | §5 |
| Readiness Review (next phase) | [04-PHASE-READINESS.md](04-PHASE-READINESS.md) |

---

## §1 — Design

- [ ] Phase scope matches [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) milestone
- [ ] Dependency phases complete and Phase Gate passed
- [ ] Structural change has **Approved** ADR ([ADR-POLICY.md](../../adr/POLICY.md))
- [ ] [13-AI-DECISION-FRAMEWORK.md](../../core/decision-framework/13-AI-DECISION-FRAMEWORK.md) — extend vs new module decided
- [ ] [templates/design-discussion.md](../templates/design-discussion.md) complete if new module required
- [ ] Backward compatibility assessed — additive default
- [ ] Future phase compatibility assessed (next 3 phases per constitution)
- [ ] [TASK_PROMPT.md](../../../TASK_PROMPT.md) rotated from [template](../templates/task-prompt.md)
- [ ] Pre-code analysis per [ENGINEERING.md](../../workflow/05-WORKFLOW.md) complete

---

## §2 — Implementation

- [ ] Implementation follows [01-ENGINEERING-STANDARD.md](../../core/standards/01-ENGINEERING.md)
- [ ] Canonical module owners respected ([AI_BRAIN_CONSTITUTION.md](../../core/ai-rules/11-AI-RULES.md))
- [ ] No duplicate services, repositories, or utilities
- [ ] No `*V2` parallel modules
- [ ] Layer boundaries preserved ([04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md))
- [ ] Composition root wiring only — no `new Repository` in domain layer
- [ ] One concern per commit per [TASK_PROMPT.md](../../../TASK_PROMPT.md) plan
- [ ] Quality gate green after each commit

---

## §3 — Tests

- [ ] [06-TESTING-STANDARD.md](../../core/standards/06-TESTING.md) — unit, repo, service coverage for changed behavior
- [ ] API E2E updated if REST contracts touched
- [ ] MCP tool tests updated if tool behavior touched
- [ ] Regression suite pass — full `npm test`
- [ ] Owner-scoped isolation tested for new persistence paths
- [ ] No tests removed without owner approval

---

## §4 — Architecture Review

- [ ] Matches approved design and ADR — no unauthorized scope expansion
- [ ] [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) extension points used correctly
- [ ] Dependency direction inward — no framework leakage into domain
- [ ] Storage independence — no vendor SQL outside adapters
- [ ] REST and MCP share same services — no duplicated business logic
- [ ] Performance budgets respected ([12-PERFORMANCE-STANDARD.md](../../supplementary/PERFORMANCE.md))
- [ ] Security preserved ([11-SECURITY-STANDARD.md](../../supplementary/SECURITY.md))
- [ ] [prompts/code-review-request.md](../prompts/code-review-request.md) executed or equivalent review

---

## §5 — Phase Gate (close current phase)

- [ ] All §1–§4 items complete
- [ ] [02-PHASE-SCORECARD.md](02-PHASE-SCORECARD.md) filled — no **FAIL**
- [ ] [ARCHITECTURE.md](../../core/architecture/10-PHASE-STATUS.md) updated
- [ ] [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) phase marked ✅
- [ ] ADR statuses updated to **Implemented**
- [ ] [PANDUAN.md](../../docs/PANDUAN.md) updated if operator-visible
- [ ] [00-PHASE-GATE.md](00-PHASE-GATE.md) verdict recorded — owner sign-off
- [ ] [03-PHASE-RETROSPECTIVE.md](03-PHASE-RETROSPECTIVE.md) drafted

---

## Forbidden

- Marking checklist complete without evidence
- Skipping §4 because tests pass
- Starting next phase before §5 owner verdict

---

*Checklist only — authoritative rules live in linked governance documents.*
