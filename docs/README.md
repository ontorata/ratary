# Human Documentation

**Purpose:** Project information for developers and operators.  
**Audience:** Humans installing, deploying, and using AI Memory Cloud.

> **AI assistants:** Do **not** treat this folder as implementation authority.  
> Read **[.ai/constitution/INDEX.md](../.ai/constitution/INDEX.md)** first — `.ai/` is the single source of truth for governance, standards, and engineering rules.

---

## Start here

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Product overview, quick start, tech stack |
| [PANDUAN.md](PANDUAN.md) | Setup, usage, MCP (Indonesian) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system explanation (human-readable) |

---

## Reference

| Document | Purpose |
|----------|---------|
| [adr/](adr/) | Architecture Decision Records (immutable decision text) |
| [archive/](archive/) | Historical phase designs — **read-only**, not implementation authority |
| [examples/](examples/) | Sample configuration files |

---

## AI Operating System (not in this folder)

All AI governance lives under **`.ai/`**:

| Topic | Path |
|-------|------|
| Entry index | [.ai/constitution/INDEX.md](../.ai/constitution/INDEX.md) |
| Constitution | [.ai/constitution/00-CONSTITUTION.md](../.ai/constitution/00-CONSTITUTION.md) |
| Standards | [.ai/core/standards/](../.ai/core/standards/) |
| Architecture law | [.ai/core/architecture/](../.ai/core/architecture/) |
| Active task | [.ai/TASK_PROMPT.md](../.ai/TASK_PROMPT.md) |
| Prompt library | [.ai/workflow/prompts/PROMPT-LIBRARY.md](../.ai/workflow/prompts/PROMPT-LIBRARY.md) |

---

## Authority rule

```
Owner instruction
  → .ai/constitution/00-CONSTITUTION.md
  → .ai/core/decision-framework/13-AI-DECISION-FRAMEWORK.md
  → .ai/core/architecture/04-ARCHITECTURE.md
  → docs/adr/ (approved ADRs)
  → .ai/core/standards/*
  → .ai/TASK_PROMPT.md
  → src/
```

Documentation in `docs/` (except ADRs) **must not** override `.ai/`.

---

*Human documentation index. AI corpus: [.ai/START-HERE.md](../.ai/START-HERE.md).*
