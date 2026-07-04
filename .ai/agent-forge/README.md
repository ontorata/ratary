# Agent Forge

**Memory-governed agent pipeline** for this repository — not a generic skill pack clone.

Unlike prompt-only libraries, Agent Forge **bookends every session with MCP memory** (`search_memory` → work → `save_memory`) and enforces **`.ai/` constitution gates** before code lands.

| Layer | Location | Role |
|-------|----------|------|
| Pipeline SSOT | [manifest.json](manifest.json) · [PIPELINE.md](PIPELINE.md) | Stage order & activation |
| Cursor skills | [`.cursor/skills/`](../../.cursor/skills/) | Auto-loaded agent instructions |
| Cursor rule | [`.cursor/rules/agent-forge.mdc`](../../.cursor/rules/agent-forge.mdc) | Mandatory skill check |
| Design drafts | [`.ai/designs/drafts/`](../designs/drafts/) | Intent & blueprint artifacts |
| Legacy prompts | [`.ai/workflow/prompts/`](../workflow/prompts/PROMPT-LIBRARY.md) | Referenced by stage, not duplicated |

## Quick start

1. Read [forge-intro](../../.cursor/skills/forge-intro/SKILL.md)
2. Enable MCP (`npm run setup`) — Recall & Remember stages need `ai-memory-cloud`
3. Agent must load relevant skill **before** each task (rule enforced)

## Philosophy

- **Recall before reason** — pull project memory first, not cold-start guessing
- **Evidence before claims** — tests and gates, not narrative completion
- **Constitution before code** — `.ai/` wins over convenience
- **Remember after work** — handoff to D1 for the next session

*Agent runtime stays external (Cursor/Claude). This repo ships workflow law only — per [11-AI-RULES.md](../core/ai-rules/11-AI-RULES.md).*
