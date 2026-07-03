# Human Documentation

**Purpose:** Project information for developers and operators.  
**Audience:** Humans installing, deploying, and using AI Memory Cloud.

**Nature:** Everything in `docs/` is **descriptive** — it explains the system. It does **not** define AI implementation behavior.

> **AI assistants:** Do **not** treat this folder as implementation authority.  
> Read **[.ai/START-HERE.md](../.ai/START-HERE.md)** first, then **[.ai/core/constitution/INDEX.md](../.ai/core/constitution/INDEX.md)**.  
> On conflict, **`.ai/` always wins.**

---

## Start here

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Product overview, quick start, tech stack |
| [PANDUAN.md](PANDUAN.md) | Setup, usage, MCP, platform infrastructure (Indonesian) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system explanation (human-readable) |
| [../README.md#instalasi-pada-lingkungan-pengembangan-baru](../README.md#instalasi-pada-lingkungan-pengembangan-baru) | Formal migration / new dev environment guide |

---

## Reference

| Document | Purpose |
|----------|---------|
| [adr/](adr/) | Architecture Decision Records (immutable decision text) |
| [adr/POLICY.md](adr/POLICY.md) | When and how to write ADRs |
| [archive/](archive/) | Historical phase designs — **read-only**, not implementation authority |
| [examples/](examples/) | Sample configuration files |

---

## AI Operating System (not in this folder)

All **normative** AI governance lives under **`.ai/`**:

| Topic | Path |
|-------|------|
| Entry | [.ai/START-HERE.md](../.ai/START-HERE.md) |
| Overview | [.ai/README.md](../.ai/README.md) |
| Index | [.ai/core/constitution/INDEX.md](../.ai/core/constitution/INDEX.md) |
| Constitution | [.ai/core/constitution/00-CONSTITUTION.md](../.ai/core/constitution/00-CONSTITUTION.md) |
| Standards | [.ai/core/standards/](../.ai/core/standards/) |
| Architecture law | [.ai/core/architecture/04-ARCHITECTURE.md](../.ai/core/architecture/04-ARCHITECTURE.md) |
| Live phase status | [.ai/core/architecture/10-PHASE-STATUS.md](../.ai/core/architecture/10-PHASE-STATUS.md) |
| Roadmap | [.ai/phases/roadmap/09-ROADMAP.md](../.ai/phases/roadmap/09-ROADMAP.md) |
| Active task | [.ai/TASK_PROMPT.md](../.ai/TASK_PROMPT.md) |
| Prompt library | [.ai/workflow/prompts/PROMPT-LIBRARY.md](../.ai/workflow/prompts/PROMPT-LIBRARY.md) |

---

## Authority rule

Full chain: [.ai/core/constitution/INDEX.md](../.ai/core/constitution/INDEX.md#Authority-Hierarchy)

```
Owner instruction
  → .ai/core/constitution/00-CONSTITUTION.md
  → .ai/core/decision-framework/13-AI-DECISION-FRAMEWORK.md
  → .ai/core/architecture/04-ARCHITECTURE.md
  → docs/adr/ (approved ADRs)
  → .ai/core/standards/*
  → .ai/TASK_PROMPT.md
  → src/
```

Documentation in `docs/` (except ADR decision text) **must not** override `.ai/`.

---

*Human documentation index. AI corpus: [.ai/START-HERE.md](../.ai/START-HERE.md).*
