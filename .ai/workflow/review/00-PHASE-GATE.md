# Phase Gate

**Purpose:** Formal decision point that closes a phase and authorizes documentation updates.  
**Audience:** Project owner (decider), AI assistants and maintainers (prepare evidence).  
**Normative keywords:** RFC 2119.

---

## When to execute

Execute Phase Gate **after**:

1. Design approved (ADR Approved if structural)
2. Implementation complete per [TASK_PROMPT.md](../../../TASK_PROMPT.md)
3. Tests pass quality gate
4. Architecture Review complete

Phase Gate precedes Readiness Review for the **next** phase.

---

## Lifecycle position

```
Design → Implementation → Tests → Architecture Review → Phase Gate → Readiness Review → Next Phase
```

---

## Gate outcomes

| Verdict | Meaning | Action |
|---------|---------|--------|
| **PASS** | All mandatory criteria met | Mark phase ✅ in roadmap; rotate TASK_PROMPT |
| **PASS WITH OBSERVATIONS** | Shippable; documented debt | PASS + observations logged in retrospective |
| **REWORK REQUIRED** | Criteria failed; fixable | Return to Implementation or Tests |
| **BLOCKER** | Constitutional violation or missing ADR | Halt; owner escalation |

---

## Mandatory criteria

All MUST pass for **PASS** or **PASS WITH OBSERVATIONS**:

- [ ] [01-PHASE-CHECKLIST.md](01-PHASE-CHECKLIST.md) — design through architecture sections complete
- [ ] [02-PHASE-SCORECARD.md](02-PHASE-SCORECARD.md) — no dimension scored **FAIL**
- [ ] `npm run lint && npm run format:check && npm run typecheck && npm test` — green
- [ ] [08-REVIEW-CHECKLIST.md](../../core/standards/08-REVIEW.md) — pre-merge items satisfied
- [ ] Phase success criteria in [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) — verified with evidence
- [ ] [ARCHITECTURE.md](../../core/architecture/10-PHASE-STATUS.md) — phase row accurate
- [ ] Relevant ADRs — status **Implemented** if structural work shipped
- [ ] No constitution violation per [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md)
- [ ] REST/MCP contracts — backward compatible or owner-approved break
- [ ] [03-PHASE-RETROSPECTIVE.md](03-PHASE-RETROSPECTIVE.md) — drafted (may complete immediately after gate)

---

## Decision record

| Field | Value |
|-------|-------|
| **Phase** | <!-- e.g. Phase 5 Embedding --> |
| **Date** | |
| **Reviewer** | <!-- owner or delegate --> |
| **Verdict** | PASS / PASS WITH OBSERVATIONS / REWORK REQUIRED / BLOCKER |
| **Test count** | |
| **ADR references** | |
| **Observations** | <!-- link to retrospective debt items --> |
| **Authorized next phase** | <!-- e.g. Phase 6 — readiness review required before code --> |

---

## Rules

- Only the **project owner** MAY issue **PASS** on phases with structural ADR impact.
- AI assistants MUST prepare gate evidence; MUST NOT self-approve Phase Gate.
- **BLOCKER** MUST halt next-phase implementation until resolved.
- Phase Gate failure MUST NOT update roadmap status to ✅.

---

## Cross references

| Document | Role |
|----------|------|
| [05-DEVELOPMENT-WORKFLOW.md](../../workflow/05-WORKFLOW.md) | Release stage |
| [07-DOCUMENTATION-STANDARD.md](../../core/standards/07-DOCUMENTATION.md) | Doc update triggers |
| [templates/completion-report.md](../templates/completion-report.md) | Evidence template |

---

*Gate authority: project owner. Subordinate to [constitution/INDEX.md](../../core/constitution/INDEX.md).*
