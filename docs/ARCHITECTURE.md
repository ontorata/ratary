# Architecture Overview

**Purpose:** Human-readable explanation of Ratary structure.  
**Audience:** Developers and operators onboarding to the project.

> **Canonical structural law (AI authority):** [.ai/core/architecture/04-ARCHITECTURE.md](../.ai/core/architecture/04-ARCHITECTURE.md)  
> **Live status:** [.ai/core/architecture/10-PHASE-STATUS.md](../.ai/core/architecture/10-PHASE-STATUS.md)  
> **Do not implement from this file alone** — it summarizes; `.ai/` governs behavior.

---

## What this system is

Ratary is a **memory foundation** for AI coding assistants. It stores durable knowledge, enriches metadata, ranks retrieval, and exposes access via **REST** and **MCP** — without embedding agent reasoning inside the repository.

Higher capabilities (agents, planning, execution) integrate **externally** at protocol boundaries.

---

## Capability stack (current)

```
Memory → Knowledge → Search → Embedding → Hybrid Retrieval → Graph → Multi-AI → Platform adapters
  ✅        ✅          ✅         ✅              ✅            ✅        ✅            ✅ (Phase 10)
```

Agent planning and execution stay **outside** this repository (MCP/REST consumers only).

**Phase 07.1 Agent Forge** defines the **contributor workflow** for this repo (Cursor skills + MCP Recall/Remember) — not server runtime. See [.ai/phases/07.1-agent-forge/](../.ai/phases/07.1-agent-forge/README.md) and [PANDUAN.md § 2.1](PANDUAN.md#21-agent-forge-kontributor-di-repo-ini).

**Phase 10 (Enterprise):** storage-agnostic infrastructure adapters (Postgres, R2/S3, pgvector, Redis, Meilisearch, Neo4j, DuckDB, Redis Streams, OpenTelemetry) wired at the composition root with opt-in env flags. Default deployment remains D1-centric. See [ADR-008–016](adr/README.md) and [.ai/phases/10-enterprise/](../.ai/phases/10-enterprise/README.md).

---

## Layer model (summary)

| Layer | Responsibility |
|-------|----------------|
| **Edge** | Routes, controllers, MCP tools — mapping only |
| **Application** | Services orchestrating use cases |
| **Domain** | Memory, knowledge, search, ranking — business rules |
| **Ports** | Vendor-neutral contracts (`ISqlDatabase`, `IVectorStore`, …) |
| **Infrastructure** | Adapters (D1, Postgres, R2, pgvector, …) — Phase 10 |
| **Composition root** | `server.ts`, `mcp/server.ts` — wires adapters |

**Rule:** REST and MCP share the same application services. No duplicated business logic.

---

## Key boundaries

| Pipeline | Purpose |
|----------|---------|
| **Search** | Paginated browse for humans/API |
| **Retrieval** | Bounded candidates for LLM context |
| **Embedding** | Async enrichment — not on CRUD hot path |

---

## Structural decisions

Recorded in [adr/](adr/). ADR decision text is immutable; status may change (Proposed → Approved → Implemented).

| ADR | Topic |
|-----|-------|
| [001](adr/001-multi-source-retrieval.md) | Hybrid retrieval (Phase 6) — **Implemented** |
| [006](adr/006-igraph-provider.md) | Graph provider (Phase 8) — **Implemented** |
| [007](adr/007-multi-ai-workspace-scope.md) | Multi-AI workspace scope — **Implemented** |
| [008](adr/008-platform-architecture.md) | Platform ports (Phase 9.5) — **Implemented** |
| [009–016](adr/README.md) | Phase 10 infrastructure adapters — **Approved** |

Full index: [adr/README.md](adr/README.md).

---

## Historical designs

Phase design documents before ADR approval live in [archive/](archive/). They are **historical references only** — not implementation authority.

---

## Where to read next

| Need | Document |
|------|----------|
| Install & use | [PANDUAN.md](PANDUAN.md) |
| New dev environment | [README.md § Instalasi](../README.md#instalasi-pada-lingkungan-pengembangan-baru) |
| AI governance | [.ai/START-HERE.md](../.ai/START-HERE.md) |
| Contributor workflow | [.ai/phases/07.1-agent-forge/](../.ai/phases/07.1-agent-forge/README.md) |
| Vocabulary | [.ai/core/glossary/GLOSSARY.md](../.ai/core/glossary/GLOSSARY.md) |

---

*Human overview only. Structural law: `.ai/core/architecture/`.*
