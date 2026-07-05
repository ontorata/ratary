# Phase 1 — Foundation — DESIGN

**Phase status:** ✅ Closed — gate PASS (2026-06-28  )  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Establish the minimal Ratary: D1-backed persistence, repository port, unified `MemoryService`, and dual transport (REST + MCP stdio) with semantic parity.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase begins — before implementation commits |
| **Updated by** | AI assistant drafts; owner approves; ADR author if structural |
| **Read-only when** | Phase gate PASS — frozen as historical design record |
| **Roadmap relation** | Captures scope and architecture evolution row |

---

## Architecture

```
Transport (REST / MCP)
       │
       ▼
MemoryService (CRUD orchestration)
       │
       ▼
IMemoryRepository → D1MemoryRepository
       │
       ▼
Cloudflare D1 (memories, identities, clients, audit_logs, settings)
```

---

## Boundaries

- Controllers/MCP tools delegate to services — no business logic in transport
- Repositories contain SQL only — no HTTP or ranking rules
- Forward-only migrations via `runMigrations()`; canonical `schema.sql` snapshot

## Ports & modules

| Port / module | Responsibility |
|---------------|----------------|
| `IMemoryRepository` | All SQL isolated; services never touch D1 APIs directly |
| `MemoryService` | Single orchestrator for create/read/update/delete/search |
| `D1Client` | Infrastructure adapter for D1 query/execute |

---

## Non-goals

- API key authentication (Phase 3)
- Knowledge metadata columns (Phase 2.6)
- Retrieval/ranking pipeline (Phase 4)
- Embeddings and vector search (Phases 5–6)
- Multi-workspace / multi-agent scope (Phase 9)


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
