# Phase 9 — Multi-AI — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Complete — ADR-007 Implemented (2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [ADR-002](../../../docs/adr/002-workspace-identity-model.md) · Implementation: [ADR-007](../../../docs/adr/007-multi-ai-workspace-scope.md)

---

## 1. Purpose

Enable **multiple AI clients** to read and write **shared workspace-scoped memory** with **agent attribution**, without rewriting core services.

Phase 9 adds:
- **Workspace** entity and `workspace_id` on memories
- **`IScopeResolver`** — effective scope from auth/MCP env
- **`IAgentIdentity`** — agent registry per workspace
- **`ISyncManager`** — MVP write reconciliation (accept + conflict audit)

Phase 9 does **not** add:
- Organization tenant / RBAC (Phase 10)
- `MemoryService` rewrite
- Breaking MCP/REST contract changes

---

## 2. Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| `workspaces` + `agents` schema | New |
| `MemoryScope` extension | Extend ADR-002 types |
| `IScopeResolver` | New port |
| `IAgentIdentity` | New port |
| `ISyncManager` | New port (MVP) |
| Repository workspace filters | Extend existing repos |
| Cross-workspace isolation tests | New E2E |

### Outside this repository

| Capability | Location |
|------------|------------|
| Agent planning / execution | External (Phase 7 boundary) |
| SSO / org billing | Phase 10 |

---

## 3. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Transport (REST / MCP)                       │
│  Auth ownerId + optional X-Workspace-Id / MCP_WORKSPACE_ID     │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     IScopeResolver (composition root)              │
│              → MemoryScope { ownerId, workspaceId, agentId }     │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│   MemoryService · ContextService · SearchService (unchanged API)  │
│              all methods still accept MemoryScope                  │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│   Repositories — WHERE owner_id = ? AND workspace_id = ?         │
└─────────────────────────────────────────────────────────────────┘

        IAgentIdentity (register/resolve agents)
        ISyncManager (MVP: accept + audit conflict)
```

### Design invariants

1. **Workspace is the shared brain boundary** — not `project` string alone.
2. **Owner ≠ Agent** — one owner, many agents, one workspace pool.
3. **Cross-workspace access denied** — 404 at application layer.
4. **Backward compatible** — solo user = default workspace; `owner_id` never removed.
5. **Additive transport** — new headers/env vars only.

---

## 4. Entity model

```
Owner (identity, Phase 3)
  └── Workspace (Phase 9) — slug "default" + named workspaces
        ├── Memory (workspace_id column)
        ├── Agent (Phase 9) — MCP client / bot identity
        └── Graph relations (owner-scoped; workspace via memory join)
```

---

## 5. Layer responsibilities

| Layer | Responsibility | Forbidden |
|-------|---------------|-----------|
| **Transport** | Pass scope hints; additive headers/env | Breaking existing routes/tools |
| **Scope** | `IScopeResolver` | Business logic in resolver |
| **Application** | Existing services + sync hook on write | New MemoryService class |
| **Ports** | `IAgentIdentity`, `ISyncManager` | D1 SQL in services |
| **Persistence** | Workspace filter in repositories | Workspace logic in controllers |

---

## 6. MCP contract (additive)

| Tool | Change |
|------|--------|
| All Phase 1–8 tools | **Unchanged** signatures |
| Scope source | Env: `MCP_OWNER_ID`, optional `MCP_WORKSPACE_ID`, `MCP_AGENT_ID` |

Optional new tools (non-blocking gate):
- `list_workspaces`
- `register_agent`

---

## 7. REST contract (additive)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/workspaces` | List workspaces for owner |
| `POST` | `/api/v1/workspaces` | Create workspace |
| `GET` | `/api/v1/workspaces/:id/agents` | List agents |
| `POST` | `/api/v1/workspaces/:id/agents` | Register agent |

Existing memory routes unchanged; optional header **`X-Workspace-Id`**.

---

## 8. Sync policy (MVP)

| Policy | Phase 9 MVP |
|--------|-------------|
| Concurrent write same memory | Last-write-wins |
| Conflict detection | Log `sync.conflict` if `updated_at` stale |
| Automatic merge | **Out of scope** |

---

## 9. Non-goals

- Organization entity and RBAC (Phase 10)
- Real-time sync / CRDT / operational transform
- Replacing `clients` table — agents complement it
- Workspace-scoped auth without owner anchor

---

## 10. Dependencies

| Dependency | Status |
|------------|--------|
| Phase 3 Auth | ✅ |
| ADR-002 contract | ✅ Approved |
| ADR-007 implementation ADR | ✅ Approved · Implemented |
| Phase 8 Graph | ✅ Complete |

---

*Aligned with [09-ROADMAP.md](../../roadmap/09-ROADMAP.md). Implementation blocked until ADR-007 **Approved**.*
