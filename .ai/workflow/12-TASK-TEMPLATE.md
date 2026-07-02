# Task Prompt — Template

**Usage:** Copy this file to `TASK_PROMPT.md` when starting a new phase or feature track. Fill every section. Delete instructional comments.

**Do not commit this template as the active task** — only `TASK_PROMPT.md` is the live prompt.

---

**Before coding:** [11-AI-RULES.md](../ai-rules/11-AI-RULES.md) · [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) · [05-WORKFLOW.md](../workflow/05-WORKFLOW.md)

---

# TASK

Implement:

<!-- Jelaskan fitur yang akan dibuat — satu kalimat scope yang jelas -->

---

## Requirements

<!-- Bullet list: functional requirements, ports, endpoints, scripts, ADR approvals needed -->

- ...

### ADR gates (if applicable)

| ADR | Title | Status |
|-----|-------|--------|
| | | **Proposed → approve** |

### Future compatibility

| Phase | Requirement |
|-------|-------------|
| 5–10 | |

---

## Constraints

- Follow [11-AI-RULES.md](../ai-rules/11-AI-RULES.md)
- Preserve architecture
- Backward compatible
- No shortcuts (`*V2`, `TODO`, `FIXME`, stubs)
- Update tests
- Update documentation if required

<!-- Add phase-specific forbidden items -->

---

## Expected deliverables

| Deliverable | Detail |
|-------------|--------|
| **Code** | |
| **Tests** | |
| **Migration** | if needed |
| **Scripts** | if needed |
| **Documentation** | ARCHITECTURE, PANDUAN, ADR status |
| **Final completion report** | Per [05-WORKFLOW.md](../workflow/05-WORKFLOW.md) — Requirement Understanding through Test Plan + definition of done |

---

## Implementation plan (commits)

| # | Commit | Scope |
|---|--------|--------|
| 1 | | one concern per commit |

**Quality gate (every commit):**

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

---

## Definition of done

- [ ] ...

---

## References

<!-- archive phase design, ADRs, related docs -->
