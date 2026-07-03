# AI Brain — Glossary

**Purpose:** Canonical terminology.  
**Authority:** Use these terms consistently.

---

## Core Concepts

| Term | Definition |
|------|------------|
| **Memory** | Atomic knowledge unit stored in AI Brain |
| **Knowledge** | Metadata on memory (codename, slug, keywords, categories) |
| **Context** | Bounded LLM prompt assembled from memories |
| **Retrieval** | Pipeline to find relevant memories |
| **Embedding** | Vector representation for semantic search |
| **Relation** | Link between two memories |
| **Scope** | Identity boundary (ownerId, workspaceId) |

---

## Actors

| Actor | Definition |
|-------|------------|
| **Human** | End user operating through UI or API |
| **AI** | Non-human actor (coding assistant, bot) |
| **Automation** | Scheduled scripts, CI/CD pipelines |
| **Webhook** | External systems calling REST |
| **MCP Client** | AI tool using MCP protocol |

---

## Layers

| Layer | Responsibility |
|-------|---------------|
| **Transport** | MCP/REST protocols |
| **Application** | Service orchestration |
| **Domain** | Pure business logic |
| **Persistence** | Data access |

---

## Patterns

| Pattern | Purpose |
|---------|---------|
| **Port** | Interface defining capability |
| **Adapter** | Implementation of port |
| **Composition Root** | Wire dependencies |
| **Repository** | Data access abstraction |
| **Retrieval Candidate** | Memory candidate from source |

---

## Phase Terminology

| Phase | Capability |
|-------|------------|
| 1 Foundation | Memory CRUD, MCP, REST |
| 2 Knowledge | Metadata, ranking, relations |
| 3 Authorization | Auth, permissions |
| 4 Intelligence | Retrieval, context, prompt |
| 5 Embedding | Vector storage |
| 6 Hybrid | SQL + Vector retrieval |
| 7 Agent Runtime | Protocol boundary |
| 8 Knowledge Graph | Graph traversal |
| 9 Multi-AI | Shared workspace |
| 10 Enterprise | Organization, RBAC |

---

## Protocol Terms

| Term | Definition |
|------|------------|
| **MCP** | Model Context Protocol |
| **REST** | HTTP API |
| **Port** | Interface contract |
| **Adapter** | Implementation |
| **Scope** | Access boundary |

---

## Forbidden Terms

Do NOT use these terms for AI Brain:

- Agent Framework
- Planner
- Executor
- Workflow Engine
- Reasoning Engine
- Autonomous Loop
- Tool Orchestrator

These belong to external systems.

---

*Use consistent terminology across all documentation and code.*
