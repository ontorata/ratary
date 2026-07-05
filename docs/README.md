# Human Documentation

**Purpose:** Project information for developers and operators.  
**Audience:** Humans installing, deploying, and using Ratary.

**Ontorata:** [ontorata.com](https://ontorata.com) · [hello@ontorata.com](mailto:hello@ontorata.com) · Founder [Lutfi Ramadhan](https://www.linkedin.com/in/lutfiramadhan/)

**Nature:** Everything in `docs/` is **descriptive** — it explains the system. It does **not** define AI implementation behavior.

> **AI assistants:** Do **not** treat this folder as implementation authority.  
> Governance lives in local `.ai/` (not in the production GitHub repo).  
> Read **[.ai/START-HERE.md](../.ai/START-HERE.md)** when present in a full dev checkout.

---

## Start here

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Product vision, quick start, capability matrix |
| [PANDUAN.md](PANDUAN.md) | Setup, usage, MCP, migration guide (Indonesian) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system explanation (human-readable) |

---

## Reference

| Document | Purpose |
|----------|---------|
| [.ai/adr/](../.ai/adr/) | Architecture Decision Records (immutable decision text) |
| [.ai/adr/POLICY.md](../.ai/adr/POLICY.md) | When and how to write ADRs |
| [.ai/archive/](../.ai/archive/) | Historical phase designs — **read-only**, not implementation authority |
| [../SDK/](../SDK/) | Minimal `@ratary/sdk` usage example |
| [examples/](examples/) | MCP configs, IDE templates, and integration patterns |
| [policies/](policies/) | OPA / Rego authorization policy examples |

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
  → .ai/adr/ (approved ADRs)
  → .ai/core/standards/*
  → .ai/TASK_PROMPT.md
  → src/
```

Documentation in `docs/` **must not** override `.ai/`.

---

*Human documentation index. AI corpus: [.ai/START-HERE.md](../.ai/START-HERE.md).*
