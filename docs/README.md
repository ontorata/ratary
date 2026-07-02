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
| [MCP-SETUP.md](MCP-SETUP.md) | MCP configuration reference |
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
| Standards | [.ai/standards/](../.ai/standards/) |
| Architecture law | [.ai/architecture/](../.ai/architecture/) |
| Active task | [.ai/TASK_PROMPT.md](../.ai/TASK_PROMPT.md) |
| Prompt library | [.ai/prompts/PROMPT-LIBRARY.md](../.ai/prompts/PROMPT-LIBRARY.md) |

Legacy paths at `docs/00-CONSTITUTION.md`, `docs/01-ENGINEERING-STANDARD.md`, etc. are **redirect stubs only**.

---

## Authority rule

```
Owner instruction
  → .ai/constitution/00-CONSTITUTION.md
  → .ai/decision-framework/13-AI-DECISION-FRAMEWORK.md
  → .ai/architecture/04-ARCHITECTURE.md
  → docs/adr/ (approved ADRs)
  → .ai/standards/*
  → .ai/TASK_PROMPT.md
  → src/
```

Documentation in `docs/` (except ADRs) **must not** override `.ai/`.

---

*Human documentation index. AI corpus: [.ai/README.md](../.ai/README.md).*
