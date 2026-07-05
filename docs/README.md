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
| Ratary MCP tools & transport | [../MCP/README.md](../MCP/README.md) |
| Grafana / Prometheus setup | [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) |
| Product overview & quick start | [../README.md](../README.md) |

**Template vs docs:**

| File | Role |
|------|------|
| [../.env.example](../.env.example) | Variable **names & defaults** (machine-readable template) |
| [CONFIGURATION.md](CONFIGURATION.md) | Variable **meaning & when to enable** (human reference) |

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

## Suggested reading order

1. [../README.md](../README.md) — what Ratary is and quick start  
2. [GUIDE.md](GUIDE.md) §1 — install and wire MCP  
3. [CONFIGURATION.md](CONFIGURATION.md) Tier 0 — required env vars  
4. [GUIDE.md](GUIDE.md) §2 — daily usage  
5. [ARCHITECTURE.md](ARCHITECTURE.md) — when you need structural context  

Contributing: [../README.md#contributing](../README.md#contributing)

---

*Human documentation index · [ontorata/ratary](https://github.com/ontorata/ratary)*
