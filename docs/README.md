# Documentation

**Audience:** Developers and operators installing, deploying, and using Ratary.

**Ontorata:** [ontorata.com](https://ontorata.com) · [hello@ontorata.com](mailto:hello@ontorata.com)

---

## Documentation map (which file answers what)

| Question | Document |
|----------|----------|
| How do I install and use Ratary daily? | **[GUIDE.md](GUIDE.md)** |
| What does each `.env` variable do? | **[CONFIGURATION.md](CONFIGURATION.md)** |
| What is Ratary architecturally? | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Copy MCP / IDE config | [examples/](examples/) |
| Enterprise authorization (OPA/Rego) | [policies/](policies/) |
| Grafana / Prometheus setup | [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) |
| Product overview & quick start | [../README.md](../README.md) |

**Template vs docs:**

| File | Role |
|------|------|
| [../.env.example](../.env.example) | Variable **names & defaults** (machine-readable template) |
| [CONFIGURATION.md](CONFIGURATION.md) | Variable **meaning & when to enable** (human reference) |

---

## What lives where

| Location | Audience | In `ontorata/ratary` (public)? | Purpose |
|----------|----------|----------------------------------|---------|
| **`docs/`** | Humans | **Yes** | Guides, configuration reference, examples |
| **`.ai/`** | AI assistants & maintainers | **No** (development mirror) | Governance — constitution, ADRs, phases |

**Rule:** `docs/` explains the system. It does **not** override implementation law in `.ai/`.

Full test suite & governance: [lutfi04/ai-brain](https://github.com/lutfi04/ai-brain).

---

## Start here

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Product vision, quick start, capabilities |
| [GUIDE.md](GUIDE.md) | Setup, daily usage, MCP, troubleshooting |
| [CONFIGURATION.md](CONFIGURATION.md) | Environment variable reference by tier |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Human-readable system summary |

---

## Reference & templates

| Document | Purpose |
|----------|---------|
| [../.env.example](../.env.example) | Env template — copy to `.env` |
| [examples/](examples/) | MCP and IDE config **templates** |
| [policies/](policies/) | **Authorization** policy samples (OPA/Rego) — not env |
| [../SDK/](../SDK/) | Minimal `@ratary/sdk` example |
| [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) | Metrics & dashboards |
| [../infrastructure/marketplace/catalog.json](../infrastructure/marketplace/catalog.json) | Plugin catalog (when `PLUGIN_MARKETPLACE_ENABLED`) |

---

## Governance (development mirror only)

Normative AI docs live under **`.ai/`** in [lutfi04/ai-brain](https://github.com/lutfi04/ai-brain) — not in the public product tree.

---

*Human documentation index. Product repo: [ontorata/ratary](https://github.com/ontorata/ratary).*
