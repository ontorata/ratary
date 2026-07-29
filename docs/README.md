# Documentation

**Audience:** Developers and operators installing, deploying, and using Ratary.

**Ontorata:** [ontorata.com](https://ontorata.com) · [hello@ontorata.com](mailto:hello@ontorata.com)

## Engineering knowledge

Architecture, ADRs, phases, evidence narratives, and roadmaps live in the private Knowledge OS:

**https://github.com/ontorata/docs-ai** → `products/ratary/`

Start: `INDEX.md` · `NOW.md` · `MAP.md` · `SEARCH.md` · `governance/PRODUCT-VS-KNOWLEDGE-OS.md`

This `docs/` tree is the **operator / product** surface only (guides, config, install, examples). Do not add MOVED stubs or parallel knowledge trees here.

---

## Documentation map (which file answers what)

| Question | Document |
|----------|----------|
| How do I use `@ratary/sdk`, CLI, or npm MCP without cloning the server? | **[packages/README.md](../packages/README.md)** |
| How do I sync Notion or Confluence into Ratary? | **[GUIDE.md — Knowledge fabric](GUIDE.md#12-knowledge-fabric-live-connectors)** |
| How do I enable knowledge fabric on production? | **[PRODUCTION-ENABLE.md](PRODUCTION-ENABLE.md)** |
| ChatGPT MCP OAuth (DCR IdP)? | **[MCP-CHATGPT-OAUTH.md](MCP-CHATGPT-OAUTH.md)** |
| OpenAPI SDK codegen CI? | **[SDK-CODEGEN-CI.md](SDK-CODEGEN-CI.md)** |
| Which enterprise modules exist and how do I turn them on? | **[ENTERPRISE-MODULES.md](ENTERPRISE-MODULES.md)** |
| What admin / operator APIs does the SDK expose? | **[packages/README.md](../packages/README.md)** · `@ratary/*@1.1.0` on [npm](https://www.npmjs.com/org/ratary) |
| How do I install Ratary in my IDE / harness? | **[install/README.md](install/README.md)** |
| How do I run Ratary in Docker? | **[DOCKER.md](DOCKER.md)** |
| How do I install and use Ratary daily? | **[GUIDE.md](GUIDE.md)** |
| What does each `.env` variable do? | **[CONFIGURATION.md](CONFIGURATION.md)** |
| Copy MCP / IDE config | [examples/](examples/) |
| Enterprise authorization (OPA/Rego) | [policies/](policies/) |
| Ratary MCP tools & transport | [../MCP/README.md](../MCP/README.md) |
| Grafana / Prometheus setup | [../observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) |
| Product overview & quick start | [../README.md](../README.md) |
| Architecture / ADR / phases / evidence | **docs-ai** (link above) |

**Template vs docs:**

| File | Role |
|------|------|
| [../.env.example](../.env.example) | Tiered variable template — **stop at Tier 1** on first install |
| [CONFIGURATION.md](CONFIGURATION.md) | Variable **meaning & when to enable** (human reference) |

**Code Memory fixture (scripts):** `evidence/phase-38-code-memory/fixture/` — keep in this repo for CLI / prove.
