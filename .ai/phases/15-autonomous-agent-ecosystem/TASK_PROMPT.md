# Task Prompt — Phase 15 Autonomous Agent Ecosystem

**Status:** 🔲 Reserved — **Do not implement until ADR-030 Approved**  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-030](../../adr/030-autonomous-agent-ecosystem.md)

---

# TASK

Implement **Phase 15 — Autonomous Agent Ecosystem**: client catalog, ecosystem manifest, `GET /api/v1/ecosystem/clients` — enabling Cursor, Claude, OpenAI, Gemini, Codex, Continue, Qwen to share **one Memory Cloud** via REST/MCP/gRPC.

**Agent runtime MUST NOT be added to this repository.**

---

## Constraints

- Constitution Phase 7 boundary — **no planner, executor, loops**
- MemoryService **unchanged**
- Catalog/metadata only in `src/ecosystem/`
- Additive REST/MCP/manifest only

## Tracks

15A SSOT registry · 15B IAgentClientCatalog · 15C manifest · 15D REST · 15E tests · 15F PANDUAN

## Definition of done

SC-15-01..09 PASS · grep confirms no agent runtime in src/

---

*Blocked until owner approval.*
