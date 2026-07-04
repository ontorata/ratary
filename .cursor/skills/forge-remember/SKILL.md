---
name: forge-remember
description: >-
  Session end handoff via MCP save_memory. Use before closing chat or after
  forge-land.
---
# Forge Remember

**Activates:** session end, after land, or before long pause.

## MCP save_memory

Include:

- **Git:** branch, commit hash, pushed or not
- **Done:** completed blueprint tasks / commits
- **Pending:** unchecked tasks, blockers
- **Next:** first action for next session

Tags: `["handoff", "ai-brain"]` (+ feature slug if any)  
Project: `ai-brain`

When inspect blockers were **resolved** in the session, optionally emit MCP `submit_signal` with `type: inspection_outcome` (severity ≥ major, `resolved: true`, `diffScope.paths`) so Phase 8.8 ledger can learn — see [08.8-inspection-pattern-ledger](../../.ai/phases/08.8-inspection-pattern-ledger/README.md).

## Without MCP

Write equivalent summary in chat; suggest user run setup if MCP missing.

## Link artifacts

Reference paths:

- `.ai/designs/drafts/{slug}.md`
- `.ai/designs/drafts/{slug}-plan.md`

Prompt cross-ref: `.ai/workflow/prompts/documentation/session-handoff.md`
