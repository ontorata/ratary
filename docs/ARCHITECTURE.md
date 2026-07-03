# Architecture Overview

**Purpose:** Human-readable explanation of AI Memory Cloud structure.  
**Audience:** Developers and operators onboarding to the project.

> **Canonical structural law (AI authority):** [.ai/architecture/04-ARCHITECTURE.md](../.ai/architecture/04-ARCHITECTURE.md)  
> **Live status:** [.ai/architecture/10-PHASE-STATUS.md](../.ai/architecture/10-PHASE-STATUS.md)  
> **Do not implement from this file alone** — it summarizes; `.ai/` governs behavior.

---

## What this system is

AI Memory Cloud is a **memory foundation** for AI coding assistants. It stores durable knowledge, enriches metadata, ranks retrieval, and exposes access via **REST** and **MCP** — without embedding agent reasoning inside the repository.

Higher capabilities (agents, planning, execution) integrate **externally** at protocol boundaries.

---

## Capability stack (current)

```
Memory → Knowledge → Search → Embedding → Hybrid Retrieval
  ✅        ✅          ✅         ✅              ✅ (Phase 6 complete)
```

Future: Graph (Phase 8), Multi-AI (Phase 9), Enterprise (Phase 10). See [.ai/roadmap/09-ROADMAP.md](../.ai/roadmap/09-ROADMAP.md).

---

## Layer model (summary)

| Layer | Responsibility |
|-------|----------------|
| **Edge** | Routes, controllers, MCP tools — mapping only |
| **Application** | Services orchestrating use cases |
| **Domain** | Memory, knowledge, search, ranking — business rules |
| **Persistence** | Repositories and stores — scoped data access |
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
| [002](adr/002-workspace-identity-model.md) | Workspace identity contract — **Approved** |
| [003](adr/003-embedding-storage-mvp.md) | Embedding storage — **Implemented** |

Full index: [adr/README.md](adr/README.md).

---

## Historical designs

Phase design documents before ADR approval live in [archive/](archive/). They are **historical references only** — not implementation authority.

---

## Where to read next

| Need | Document |
|------|----------|
| Install & use | [PANDUAN.md](PANDUAN.md) |
| MCP setup | [MCP-SETUP.md](MCP-SETUP.md) |
| AI governance | [.ai/constitution/INDEX.md](../.ai/constitution/INDEX.md) |
| Vocabulary | [.ai/glossary/GLOSSARY.md](../.ai/glossary/GLOSSARY.md) |

---

*Human overview only. Structural law: `.ai/architecture/`.*
