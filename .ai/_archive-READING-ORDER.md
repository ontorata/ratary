# Recommended Reading Order

**Purpose:** Mandatory document sequence for AI assistants before modifying this repository.  
**Audience:** All AI assistants at session start and before each implementation task.

---

## Session start (every chat)

**First read:** [constitution/INDEX.md](constitution/INDEX.md) — mandatory entry point.

Then follow the numbered reading order defined there (Constitution through Roadmap).

Supplementary sequences:

---

## Before implementation (task-specific)

After session start, read only what the task requires:

| Condition | Additional reading |
|-----------|-------------------|
| Structural or multi-layer change | Relevant [decisions/accepted](decisions/accepted/README.md) ADRs |
| New port or storage | [governance/policy/adr-policy](../docs/adr/POLICY.md) + ADR template |
| API or MCP change | [governance/standards/engineering](../standards/01-ENGINEERING.md), [security](../supplementary/SECURITY.md) |
| Performance-sensitive path | [governance/standards/performance](../supplementary/PERFORMANCE.md) |
| Test changes | [governance/standards/testing](../standards/06-TESTING.md) |
| Doc changes | [communication/writing-standard](../supplementary/WRITING.md) |

Then execute [prompts/pre-implementation.md](prompts/pre-implementation.md).

---

## Before merge (verification)

| Step | Document |
|------|----------|
| 1 | [checklists/decision-gate.md](checklists/decision-gate.md) |
| 2 | [checklists/pre-merge.md](checklists/pre-merge.md) |
| 3 | [workflow/development-workflow](../workflow/05-WORKFLOW.md) quality gates |

---

## Phase transition

| Step | Document |
|------|----------|
| 1 | [roadmap/phases](../roadmap/09-ROADMAP.md) |
| 2 | [prompts/phase-handoff.md](prompts/phase-handoff.md) |
| 3 | [templates/completion-report.md](templates/completion-report.md) |

---

## What NOT to read first

- `src/` before governance (risks pattern-copying over law)
- [templates/](templates/README.md) at session start (templates are blanks, not instructions)
- [implementation/](implementation/README.md) user guides for coding decisions
- Archive design docs unless referenced by TASK_PROMPT

---

*Enforced by [workflow/decision-framework](../decision-framework/13-AI-DECISION-FRAMEWORK.md) Decision Flow.*
