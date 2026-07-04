---
name: forge-inspect
description: >-
  Gate review between blueprint tasks: spec compliance then code quality.
  Critical or constitutional issues block the next task.
---
# Forge Inspect

**Activates:** between `forge-execute` tasks (and before land).

## Two passes

### Pass 1 — Spec compliance

- Diff matches current blueprint task only
- ADR / phase requirements satisfied
- No forbidden patterns ([11-AI-RULES.md](../../.ai/core/ai-rules/11-AI-RULES.md) Never create)
- **Inspection Pattern Ledger (Phase 8.8):** recall relevant ledger entries via MCP `search_memory` tag `inspection-pattern` or REST `/api/v1/inspection-patterns?path=…` — use as prioritized checklist only; **constitutional blockers still come from spec**, not ledger alone

### Pass 2 — Code quality

- Layer boundaries (no transport in services)
- Matches [.ai/core/standards/02-CODING.md](../../.ai/core/standards/02-CODING.md)
- Tests exist for behavior changes

## Severity

| Level | Action |
|-------|--------|
| **constitutional** | Block — fix before next task |
| **critical** | Block — fix before next task |
| **major** | Fix in current task if small; else add blueprint task |
| **minor** | Note; optional follow-up |

## Output

```markdown
## Inspect — Task N
- Spec: PASS / FAIL
- Quality: PASS / FAIL
- Blockers: (list or none)
```

Prompt cross-ref: `.ai/workflow/prompts/review/code-review.md`

Optional: launch Bugbot subagent for large diffs when user requests.
