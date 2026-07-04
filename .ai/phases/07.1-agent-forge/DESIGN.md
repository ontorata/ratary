# Phase 07.1 — Agent Forge — DESIGN

**Status:** Approved · Implemented 2026-07-05

---

## Problem

`.ai/workflow/prompts/` (40 prompts) is static — agents do not auto-activate stages, and sessions cold-start without MCP memory. External skill packs clone generic workflows without constitution or `search_memory`/`save_memory` bookends.

## Decision

Introduce **Agent Forge** as Phase **07.1** extension track:

1. **Cursor skills** (`.cursor/skills/forge-*`) — auto-discovered instructions
2. **Mandatory rule** (`.cursor/rules/agent-forge.mdc`) — check skill before task
3. **Manifest** ([manifest.json](manifest.json)) — machine-readable stage graph
4. **Design drafts** (`.ai/designs/drafts/`) — intent + blueprint artifacts

## Non-goals

- No agent runtime, planner, or LLM logic in `src/` (constitution)
- No replacement of `.ai/workflow/prompts/` — skills **reference** prompt IDs
- No npm package — skills are repo-local for contributors

## Stages

See [PIPELINE.md](PIPELINE.md).

## Innovation vs generic skill packs

| Generic pack | Agent Forge |
|--------------|-------------|
| Cold start | **Recall** via MCP |
| Generic TDD | **Prove** + constitution layer lint |
| End of chat | **Remember** handoff to D1 |
| Copy-paste prompts | Links to `.ai/workflow/prompts/{id}` |

## Authority

Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) and [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md) (no agent code in repo).
