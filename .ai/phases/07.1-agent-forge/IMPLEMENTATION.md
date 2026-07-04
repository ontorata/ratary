# Phase 07.1 — Agent Forge — IMPLEMENTATION

**Status:** Implemented 2026-07-05

---

## Deliverables

| Artifact | Path |
|----------|------|
| Pipeline manifest | [manifest.json](manifest.json) |
| Stage diagram | [PIPELINE.md](PIPELINE.md) |
| Cursor rule | `.cursor/rules/agent-forge.mdc` |
| Skills (13) | `.cursor/skills/forge-*/SKILL.md` |
| Design draft area | `.ai/designs/drafts/` |

## Skills registry

| Skill | Stage |
|-------|-------|
| `forge-recall` | Session start |
| `forge-intent` | Pre-code design |
| `forge-isolate` | Git worktree |
| `forge-blueprint` | Task plan |
| `forge-execute` | Implementation |
| `forge-prove` | Evidence-first tests |
| `forge-inspect` | Gate review |
| `forge-land` | Branch completion |
| `forge-remember` | MCP handoff |
| `forge-diagnose` | Failure RCA |
| `forge-parallel` | Parallel tracks |
| `forge-skillcraft` | New skills |
| `forge-intro` | Onboarding |

## Commit

`ced71d0` — initial Forge + MCP listing folder; relocated to `phases/07.1-agent-forge/` in follow-up.

## No `src/` changes

Workflow law only — consistent with Phase 7 external runtime boundary.
