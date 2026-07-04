# Phase 07.1 — Agent Forge — RETROSPECTIVE

**Date:** 2026-07-05

---

## What worked

- Extension track `07.1` cleanly extends Phase 7 without new ADR
- MCP Recall/Remember differentiates from generic skill packs
- Skills stay in `.cursor/skills/` (Cursor requirement) while SSOT lives in `phases/`

## Debt accepted

- Skill activation timing is agent-side (not enforceable in CI beyond manifest/rule checks)
- Skills rely on Cursor discovering `.cursor/skills/` — other IDEs need manual prompt import

## Done (closure)

- Cross-referenced from [START-HERE.md](../../START-HERE.md), [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md), [PANDUAN.md](../../../docs/PANDUAN.md)
- [07-agent-runtime](../07-agent-runtime/COMPLETION.md) successor table includes 07.1
