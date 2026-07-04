# Phase 15 — Autonomous Agent Ecosystem

**Status:** 🔲 Reserved — Design draft (2026-07-04); **awaiting owner approval**  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 15  
**ADR gate:** [ADR-030](../../adr/030-autonomous-agent-ecosystem.md) — **Proposed**

---

## Summary

Enable **Cursor, Claude, OpenAI, Gemini, Codex, Continue, Qwen** (and successors) to share the **same Memory Cloud** via **REST · MCP · gRPC** — with **agent runtime strictly outside** this repository.

| In repo | Outside repo |
|---------|--------------|
| Protocol access, workspace scope, agent **identity registry**, ecosystem manifest | Planner, executor, autonomous loops, orchestration |

**Renumbering:** Former Phase 15 *Content & Vector Scale* → **Phase 17**.

**Hard dependency:** Phase 7 ✅ · Phase 9 ✅ · Phase 7.5 ✅ · Phase 13 recommended · Phase 14 optional

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Full design |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Implementation prompt |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [COMPLETION_TEMPLATE.md](COMPLETION_TEMPLATE.md) | Closure form |
| [RISKS.md](RISKS.md) | Risk register |

---

*Constitution §3: Agent runtime **forbidden** in repo. Phase 15 extends **contracts only**.*
