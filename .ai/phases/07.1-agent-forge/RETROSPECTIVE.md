# Phase 07.1 — Agent Forge — RETROSPECTIVE

**Date:** 2026-07-05

---

## What worked

- Extension track `07.1` cleanly extends Phase 7 without new ADR
- MCP Recall/Remember differentiates from generic skill packs
- Skills stay in `.cursor/skills/` (Cursor requirement) while SSOT lives in `phases/`

## Debt accepted

- No automated test for skill activation (agent-side behavior)
- Skills rely on Cursor discovering `.cursor/skills/` — other IDEs need manual prompt import

## Recommendation

- Reference Phase 07.1 from [07-agent-runtime](../07-agent-runtime/README.md) README
- On major pipeline change, bump `manifest.json` version and append CHECKLIST addendum
