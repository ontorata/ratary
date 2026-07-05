# Architecture Overview

**Purpose:** Human-readable explanation of Ratary structure.  
**Audience:** Developers and operators onboarding to the project.

> **This file is a summary for humans.** For behavior authority, see source code (`src/`) and [.env.example](../.env.example) / [CONFIGURATION.md](CONFIGURATION.md) for runtime flags.

---

## What this system is

Ratary is a **memory foundation** for AI coding assistants. It stores durable knowledge, enriches metadata, ranks retrieval, and exposes access via **REST** and **Ratary MCP** — without embedding agent reasoning inside the repository.

Higher capabilities (agents, planning, execution) integrate **externally** at protocol boundaries.

---

## Capability stack (current)

```
Memory → Knowledge → Search → Embedding → Hybrid Retrieval → Graph → Multi-AI → Platform adapters
```

Agent planning and execution stay **outside** this repository (MCP/REST consumers only).

**npm clients (`@ratary`):** [`@ratary/sdk@1.1.0`](https://www.npmjs.com/package/@ratary/sdk), [`@ratary/cli@1.1.0`](https://www.npmjs.com/package/@ratary/cli), [`@ratary/mcp-server@1.1.0`](https://www.npmjs.com/package/@ratary/mcp-server) — SDK exposes `client.memory`, `client.context`, and **`client.admin`** (cloud, observability, infrastructure, platform, knowledgeFabric, federation). Source in `packages/`. See [packages/README.md](../packages/README.md).

**Knowledge fabric (opt-in):** `src/knowledge-fabric-platform/` — live connectors (Notion), sync job runner, webhook HMAC. Default OFF; enable via [CONFIGURATION — Knowledge fabric](CONFIGURATION.md#knowledge-fabric-connectors).

**Ontorata ecosystem (outside this repo):** [Ontorata Studio](https://github.com/ontorata/Ontorata-Studio) operator UI (`@ratary/sdk` only) · [Ontorata MCP](https://github.com/ontorata/ontorata-mcp) ecosystem gateway.

**Platform adapters:** peer SQL backends (D1, Postgres, Supabase, MariaDB/MySQL, TiDB/Cockroach) plus optional pgvector, R2/S3/MinIO, Azure Blob, GCS, Redis, Meilisearch, OpenSearch, Neo4j, DuckDB, ClickHouse — selected via env. See [CONFIGURATION.md](CONFIGURATION.md) Tier 0–2 and [DOCKER.md](DOCKER.md) compose profiles.

**Observability:** Prometheus, Grafana dashboards, optional cost gauges — default OFF. See [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) and [GUIDE — Observability](GUIDE.md#10-observability).

---

## Layer model (summary)

| Layer | Responsibility |
|-------|----------------|
| **Edge** | Routes, controllers, MCP tools — mapping only |
| **Application** | Services orchestrating use cases |
| **Domain** | Memory, knowledge, search, ranking — business rules |
| **Ports** | Vendor-neutral contracts (`ISqlDatabase`, `IVectorStore`, …) |
| **Infrastructure** | Adapters (D1, Postgres, MariaDB, R2/MinIO, pgvector, OpenSearch, ClickHouse, …) |
| **Composition root** | `server.ts`, MCP transport — wires adapters |

**Rule:** REST and MCP share the same application services. No duplicated business logic.

---

## Key boundaries

| Pipeline | Purpose |
|----------|---------|
| **Search** | Paginated browse for humans/API |
| **Retrieval** | Bounded candidates for LLM context |
| **Embedding** | Async enrichment — not on CRUD hot path |

Product-level diagrams and ecosystem map: [../README.md](../README.md#visual-architecture).

---

## Where to read next

| Need | Document |
|------|----------|
| Documentation index | [README.md](README.md) |
| Install & daily use | [GUIDE.md](GUIDE.md) |
| Environment variables | [CONFIGURATION.md](CONFIGURATION.md) |
| MCP / IDE templates | [examples/](examples/) |
| Enterprise authorization (OPA) | [policies/](policies/) |
| New dev machine | [GUIDE — New development machine](GUIDE.md#9-new-development-machine) |
| Ecosystem & capabilities | [../README.md](../README.md) |
| MCP tools | [../MCP/README.md](../MCP/README.md) |
| Ontorata Studio | [GUIDE — Studio](GUIDE.md#ontorata-studio-web-console) |

---

*Human overview only.*
