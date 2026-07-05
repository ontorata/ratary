# Documentation

**Audience:** Developers and operators installing, deploying, and using Ratary.

**Ontorata:** [ontorata.com](https://ontorata.com) · [hello@ontorata.com](mailto:hello@ontorata.com)

---

## What lives where

| Location | Audience | In `ontorata/ratary` (public)? | Purpose |
|----------|----------|----------------------------------|---------|
| **`docs/`** | Humans | **Yes** | Descriptive guides — setup, architecture overview, examples |
| **`.ai/`** | AI assistants & maintainers | **No** (development mirror) | Normative governance — constitution, ADRs, phases, Forge workflow |

**Rule:** `docs/` explains the system. It does **not** override implementation law in `.ai/`.

If you cloned only the public repo, you have everything needed to **run and use** Ratary. For full test suite, phase gates, and Agent Forge SSOT, use the [development mirror](https://github.com/lutfi04/ai-brain) (same code boundary, separate remote).

---

## Start here

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Product vision, quick start, capabilities |
| **[GUIDE.md](GUIDE.md)** | **Setup, daily usage, MCP, ops, troubleshooting** |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Human-readable system overview (summary only) |
| [examples/](examples/) | MCP configs, IDE templates, SDK patterns |
| [../MCP/README.md](../MCP/README.md) | Ratary MCP listing & tool reference |

---

## Reference

| Document | Purpose |
|----------|---------|
| [../.env.example](../.env.example) | Environment variables |
| [../SDK/](../SDK/) | Minimal `@ratary/sdk` example |
| [policies/](policies/) | OPA / Rego authorization examples |
| [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) | Prometheus / Grafana wiring |

---

## Governance (development mirror — not in public tree)

Normative AI documentation lives under **`.ai/`** in the [lutfi04/ai-brain](https://github.com/lutfi04/ai-brain) checkout:

| Topic | Path (mirror only) |
|-------|---------------------|
| Entry | `.ai/START-HERE.md` |
| Constitution | `.ai/core/constitution/00-CONSTITUTION.md` |
| Architecture law | `.ai/core/architecture/04-ARCHITECTURE.md` |
| ADRs | `.ai/adr/` |
| Phases & roadmap | `.ai/phases/` |
| Agent Forge | `.ai/phases/07.1-agent-forge/` |

**AI assistants** with a full dev checkout: read `.ai/START-HERE.md` before implementing structural changes.

---

## Authority hierarchy (summary)

```
Owner instruction
  → .ai/ constitution & ADRs (mirror)
  → src/ (Ratary Server)
  → docs/ (human explanation — must not contradict shipped behavior)
```

---

*Human documentation index. Product repo: [ontorata/ratary](https://github.com/ontorata/ratary).*
