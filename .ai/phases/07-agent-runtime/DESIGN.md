# Phase 7 — Agent Runtime — DESIGN

**Document:** DESIGN  
**Phase status:** Active  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Define the agent integration boundary for AI Brain memory foundation. This is a **documentation-only phase** — no agent orchestration code exists or will exist in this repository.

---

## Scope

**Outside this repository:**
- Agent loops, planning, and execution
- Agent orchestration frameworks
- External agent runtimes

**Inside this repository:**
- MCP tools for memory operations
- REST API for memory operations
- Protocol contracts (stable interfaces)

---

## Architecture Decision: Agent Boundary

### Principle

AI Brain is a **memory foundation** — not an agent runtime. Agent capabilities (planning, execution, tool orchestration) live in external systems that consume the memory foundation via MCP or REST.

### Boundary Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        External Agent                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Planner   │→ │    Tools     │→ │      Executor       │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ MCP/REST
┌─────────────────────────────────────────────────────────────────┐
│                     AI Brain (This Repo)                        │
│  ┌─────────┐  ┌─────────────┐  ┌────────────────────────┐    │
│  │   MCP   │→ │  Services   │→ │   Repositories        │    │
│  │  Tools  │  │  (Logic)    │  │   (Persistence)      │    │
│  └─────────┘  └─────────────┘  └────────────────────────┘    │
│                                                                 │
│  Memory → Knowledge → Embedding → Retrieval → Context          │
└─────────────────────────────────────────────────────────────────┘
```

### Protocol Contracts

#### MCP Tools (Stable)

| Tool | Purpose | Agent Usage |
|------|---------|-------------|
| `save_memory` | Store new memory | Agent captures observations |
| `search_memories` | Keyword search | Agent retrieves relevant memories |
| `get_memory` | Retrieve by ID | Agent fetches specific memory |
| `update_memory` | Modify memory | Agent corrects/extends memory |
| `delete_memory` | Remove memory | Agent removes outdated memory |
| `get_context` | Build LLM context | Agent gets relevant context for reasoning |
| `build_prompt` | Format context | Agent assembles prompt with context |
| `list_relations` | Get memory relations | Agent explores memory connections |

#### REST API (Stable)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/memories` | Create memory |
| `GET /api/v1/memories` | List memories |
| `GET /api/v1/memories/:id` | Get memory |
| `PATCH /api/v1/memories/:id` | Update memory |
| `DELETE /api/v1/memories/:id` | Delete memory |
| `POST /api/v1/memories/search` | Search memories |
| `POST /api/v1/context` | Build retrieval context |
| `POST /api/v1/memories/:id/relations` | Manage relations |

---

## Agent Integration Patterns

### Pattern 1: Observe → Store → Reason → Act

```
1. Agent observes: User says "remember X"
2. Agent calls: save_memory({ content: "X", ... })
3. Agent reasons: build_prompt({ query: "what do I know about X?" })
4. Agent acts: Based on retrieved context
```

### Pattern 2: Retrieve → Augment → Execute

```
1. Agent retrieves: get_context({ query: task })
2. Agent augments: Adds retrieved memories to prompt
3. Agent executes: LLM reasons with memory context
```

### Pattern 3: Explore → Connect → Remember

```
1. Agent explores: list_relations({ memoryId })
2. Agent connects: create_relation({ ... })
3. Agent remembers: update_memory({ relatedTo: [...] })
```

---

## Optional: `agentId` in MemoryScope (Phase 9)

Phase 7 does **not** implement `agentId`. This is deferred to Phase 9 when:
- Multi-agent scenarios need attribution
- Workspace-scoped agents require isolation

Current: All memories are `ownerId`-scoped only.

---

## Constitution Boundary

Per Constitution Rule 7: **No agent reasoning inside the foundation.**

This means:
- ❌ No planning algorithms in `src/services/`
- ❌ No tool orchestration in `src/memory/`
- ❌ No agent state management
- ✅ MCP tools for memory operations
- ✅ REST API for memory operations
- ✅ Retrieval pipelines (SQL, vector, future graph)

---

## Success Criteria

1. **External agent can complete save → context → act loop via MCP**
   - Verified by: Integration test with external agent
   - Evidence: MCP tool documentation

2. **No agent planner code in `src/services/` or `src/memory/`**
   - Verified by: Code review
   - Evidence: Directory scan shows no agent/plan/orchestrate modules

3. **Constitution boundary preserved**
   - Verified by: 08-REVIEW-CHECKLIST
   - Evidence: Phase 7 review passes all gates

---

## Future Phases

| Phase | Integration Impact |
|-------|-------------------|
| Phase 8 | Graph retrieval adds `list_neighbors` pattern |
| Phase 9 | `agentId` enables multi-agent attribution |
| Phase 10 | Organization scope for agent teams |

---

## References

- [ADR-001 Multi-Source Retrieval](../adr/../docs/adr/001-multi-source-retrieval.md) — Hybrid retrieval enables richer context
- [ADR-002 Workspace Identity](../adr/../docs/adr/002-workspace-identity-model.md) — Future scope types
- [ADR-003 Embedding Storage](../adr/../docs/adr/003-embedding-storage-mvp.md) — Vector search foundation

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
