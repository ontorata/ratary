---
name: forge-intro
description: >-
  Onboard to Agent Forge pipeline. Use when first using this repo, asking how
  agent workflow works, or what skills to run.
---
# Forge Intro

Agent Forge is this repo's **memory-governed** pipeline — different from generic skill packs:

- **Recall / Remember** use MCP `ratary` (persistent handoffs)
- Stages map to `.ai/` governance (constitution, ADR, phases)
- Skills live in `.cursor/skills/forge-*`

## Read first

1. [.ai/phases/07.1-agent-forge/PIPELINE.md](../../.ai/phases/07.1-agent-forge/PIPELINE.md)
2. [.ai/START-HERE.md](../../.ai/START-HERE.md)
3. [.ai/TASK_PROMPT.md](../../.ai/TASK_PROMPT.md) if active work exists

## Stage cheat sheet

| You are about to… | Skill |
|-------------------|-------|
| Start a session | `forge-recall` |
| Explore a vague idea | `forge-intent` |
| Code after design OK | `forge-isolate` → `forge-blueprint` → `forge-execute` |
| Write/fix tests | `forge-prove` |
| Review between tasks | `forge-inspect` |
| Finish a branch | `forge-land` |
| End session | `forge-remember` |
| Debug a failure | `forge-diagnose` |

Rules are **mandatory**, not suggestions — see `.cursor/rules/agent-forge.mdc`.
