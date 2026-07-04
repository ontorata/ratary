# Phase 07.1 — Agent Forge — TESTING

**Status:** Manual verification (docs-only phase)

---

## Verification checklist

- [x] `.cursor/rules/agent-forge.mdc` has `alwaysApply: true`
- [x] 13 skills under `.cursor/skills/forge-*` with valid frontmatter
- [x] [manifest.json](manifest.json) stage IDs match skill names
- [x] Skills link to `.ai/phases/07.1-agent-forge/PIPELINE.md` (not stale paths)
- [x] `forge-recall` / `forge-remember` reference MCP tools when available

## Manual smoke

1. New Cursor chat → agent should read `forge-recall` at session start (rule + user habit)
2. Trigger "how does forge work" → `forge-intro` description match
3. End session → `save_memory` handoff per `forge-remember`

No automated test suite — behavior is agent-side, not server-side.
