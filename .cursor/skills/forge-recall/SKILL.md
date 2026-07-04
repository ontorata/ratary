---
name: forge-recall
description: >-
  Session start: load memory context via MCP and governance before any work.
  Use at the beginning of every chat or when resuming a task.
---
# Forge Recall

**Activates:** every session start (before design or code).

## Steps

1. Call MCP `search_memory` with project name (`ai-brain`) or task topic
2. If user said "lanjut" / handoff: search `handoff` or use `get_memory_by_codename`
3. Read [.ai/TASK_PROMPT.md](../../.ai/TASK_PROMPT.md) and [.ai/core/constitution/INDEX.md](../../.ai/core/constitution/INDEX.md)
4. Restate task, constraints, and which Forge stages apply
5. Ask blocking questions only — do not implement yet

## Output

Short **Recall brief**: what memory says, current branch/commit if known, planned stage chain.

## Skip when

Read-only one-line questions with no repo impact — still read TASK_PROMPT if structural.
