# Architecture Overview

**Purpose:** Human-readable explanation of Ratary structure.  
**Audience:** Developers and operators onboarding to the project.

> **This file is a summary for humans.** It does not define implementation behavior.  
> **Structural law** lives in `.ai/` on the [development mirror](https://github.com/lutfi04/ai-brain) — not shipped in the public `ontorata/ratary` tree.

---

## What this system is

Ratary is a **memory foundation** for AI coding assistants. It stores durable knowledge, enriches metadata, ranks retrieval, and exposes access via **REST** and **Ratary MCP** — without embedding agent reasoning inside the repository.

Higher capabilities (agents, planning, execution) integrate **externally** at protocol boundaries.

---

## Capability stack (current)

```
Memory → Knowledge → Search → Embedding → Hybrid Retrieval → Graph → Multi-AI → Platform adapters
  ✅        ✅          ✅         ✅              ✅            ✅        ✅            ✅ (Phase 10)
```

Agent planning and execution stay **outside** this repository (MCP/REST consumers only).

**Agent Forge (Phase 07.1)** is the **contributor workflow** (Cursor skills + MCP Recall/Remember) — not server runtime. See [GUIDE.md § 2.1](GUIDE.md#21-agent-forge-contributors) and the mirror: `.ai/phases/07.1-agent-forge/`.

**Enterprise platform (Phase 10):** storage-agnostic adapters (Postgres, R2/S3, pgvector, Redis, Meilisearch, Neo4j, DuckDB, Redis Streams, OpenTelemetry) — all opt-in via env flags. Default deploy remains D1-centric.

**Observability (Phase 19):** Prometheus, Grafana dashboards, optional cost gauges — default OFF. See [observability/EXTERNAL-STACK.md](../observability/EXTERNAL-STACK.md).

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

---

## Where to read next

| Need | Document |
|------|----------|
| Install & daily use | [GUIDE.md](GUIDE.md) |
| Docs index | [README.md](README.md) |
| New dev machine | [GUIDE.md § 9](GUIDE.md#9-new-development-machine) |
| Ecosystem & capabilities | [../README.md](../README.md) |
| MCP tools | [../MCP/README.md](../MCP/README.md) |
| AI governance (mirror) | [lutfi04/ai-brain](https://github.com/lutfi04/ai-brain) → `.ai/START-HERE.md` |

---

## docs/ vs `.ai/`

| Folder | Role |
|--------|------|
| **`docs/`** | Human guides — you are here |
| **`.ai/`** | AI implementation authority — phases, ADRs, constitution (development mirror only) |

Do not implement structural changes from `docs/` alone.

---

*Human overview only.*
