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

**Platform adapters:** storage-agnostic backends (Postgres, R2/S3, pgvector, Redis, Meilisearch, Neo4j, DuckDB, Redis Streams, OpenTelemetry) — all opt-in via env flags. Default deploy remains D1-centric. See [CONFIGURATION.md](CONFIGURATION.md) Tier 2.

**Observability:** Prometheus, Grafana dashboards, optional cost gauges — default OFF. See [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md) and [GUIDE — Observability](GUIDE.md#10-observability).

---

## Layer model (summary)

| Layer | Responsibility |
|-------|----------------|
| **Edge** | Routes, controllers, MCP tools — mapping only |
| **Application** | Services orchestrating use cases |
| **Domain** | Memory, knowledge, search, ranking — business rules |
| **Ports** | Vendor-neutral contracts (`ISqlDatabase`, `IVectorStore`, …) |
| **Infrastructure** | Adapters (D1, Postgres, R2, pgvector, …) |
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

---

*Human overview only.*
