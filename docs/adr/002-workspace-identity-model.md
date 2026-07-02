# ADR-002: Workspace & Identity Model

**Status:** Approved  
**Date:** 2026-07-01  
**Deciders:** Project owner  
**Scope:** Future contract only — **no implementation** in Phase 5. Guides Phases 5–10 without refactoring `MemoryService`, `KnowledgeService`, or `SearchService` cores.

---

## Context

Today the system scopes all memory operations with a flat **`owner_id`** (REST: `request.user.ownerId`; MCP: `MCP_OWNER_ID`). Project grouping uses string fields `project` / `project_id` on each memory row. Auth identities (API key, JWT, OAuth) map 1:1 to an `owner_id`.

Phases 8–10 require: knowledge graph traversal, multiple AI agents sharing a brain, and enterprise tenancy (organization, workspace, RBAC, audit). Without a documented identity model, late phases force rewrites of services that are stable today.

This ADR defines the **target entity model and scope contract** so Phases 5–7 remain compatible while Phases 8–10 add adapters—not replace core services.

## Problem

| Gap today | Future need |
|-----------|-------------|
| Single `owner_id` | Organization → Workspace hierarchy |
| No agent identity | Multiple AIs writing/reading same workspace |
| Flat `memory_relations` | Graph traversal (`GraphProvider`) |
| Coarse permissions | Workspace-scoped RBAC (Phase 10) |
| MCP = one owner env | Agent + workspace binding |

If Phase 5–7 hard-code “owner only” inside services (not ports), Phase 9–10 will require a **large refactor** of `MemoryService`, `KnowledgeService`, and `SearchService`.

## Constraints

- **Constitution:** No `MemoryServiceV2`; extend existing services via scope + ports.
- **Backward compatibility:** `owner_id` remains valid indefinitely for solo/personal use.
- **Phase 5 start:** No schema migration for org/workspace in Phase 5; embedding ports must accept today’s `MemoryScope`.
- **MCP/REST contracts:** Additive fields only until explicit major version.
- **Infrastructure replaceable:** Tenancy is a **scope resolver**, not D1-specific SQL.
- **ADR-002 is contract-only:** Implementation commits require separate ADRs per phase.

## Alternatives

### Option A — Document target model now; evolve `MemoryScope` additively

- Pros: Phase 5–7 code passes `ownerId`; optional `workspaceId` later; services unchanged.
- Cons: Discipline required—no premature columns.

### Option B — Add `organization_id` / `workspace_id` columns in Phase 5

- Pros: Schema “ready.”
- Cons: Premature without auth/RBAC; violates one-concern-per-phase; empty columns everywhere.

### Option C — Replace `owner_id` with workspace-only model

- Pros: Clean multi-tenant story.
- Cons: **Breaking** MCP, REST, 110 tests, production data; rejected.

## Decision

**Adopt Option A:** ratify the entity model and **scope port contract** below. Current code continues with `MemoryScope { ownerId }`. Future phases **extend scope and add ports** without renaming core services.

---

## Target entity model (contract)

```
Organization          (Phase 10 — enterprise tenant)
    │
    ├── Workspace     (Phase 9–10 — shared brain boundary)
    │       │
    │       ├── Project        (existing — logical grouping on Memory)
    │       ├── Memory         (resource)
    │       ├── Agent          (Phase 9 — AI actor identity)
    │       └── Graph edges    (Phase 8 — via GraphProvider)
    │
    └── Owner (Identity)      (Phase 3 today — human/service account)
```

### Entity definitions

| Entity | Purpose | Phase | Maps from today |
|--------|---------|-------|-----------------|
| **Organization** | Billing, policy, residency, SSO boundary | 10 | — (new) |
| **Workspace** | Shared memory pool for a team or product | 9–10 | Optional; solo user = implicit default workspace |
| **Project** | Filter/group memories (codename prefix, tags) | 2.6+ ✅ | `memories.project` + `project_id` |
| **Owner** | Identity that owns credentials | 3 ✅ | `owner_id`, `identities.owner_id` |
| **Agent** | Non-human actor (Cursor, Claude, bot) | 9 | — (new); MCP client → agent binding |
| **Memory** | Atomic knowledge unit | 1+ ✅ | `memories` row |

### Invariants (all phases)

1. Every memory belongs to exactly one **Workspace** (explicit or default).
2. Every API/MCP operation resolves an **effective scope** before repository access.
3. **Owner** ≠ **Agent**: one owner may run many agents; agents act inside a workspace.
4. **Project** is a label on memory, not a security boundary (workspace is).
5. Cross-workspace access is **denied** (404 at app layer, same as cross-owner today).

---

## Scope contract (port — future)

Today:

```typescript
interface MemoryScope {
  ownerId: string;
}
```

Target (additive — fields optional until phase activates):

```typescript
interface MemoryScope {
  ownerId: string;              // required today; legacy + identity anchor
  organizationId?: string;      // Phase 10
  workspaceId?: string;         // Phase 9–10
  agentId?: string;             // Phase 9 — actor attribution
  projectId?: string;           // filter hint (already used in retrieval)
}
```

**`IScopeResolver`** (Phase 9+ implementation):

```typescript
interface IScopeResolver {
  resolveFromAuth(auth: AuthUser, hints?: { workspaceId?: string }): Promise<MemoryScope>;
  resolveFromMcp(env: McpScopeEnv): MemoryScope;
}
```

Composition root wires resolver; **`MemoryService` / `ContextService` / `SearchService` keep accepting `MemoryScope`** — no signature churn on core methods.

### Repository rule

All repository ports continue to require explicit scope fields. When `workspace_id` column exists (Phase 10), queries become:

`WHERE workspace_id = ? AND owner_id = ?` (or workspace-only after migration ADR).

Phase 5–7: **only `owner_id` in SQL** — compliant with this ADR.

---

## Phase extensions (ports only — no core service rewrite)

| Phase | Addition | Core services |
|-------|----------|-----------------|
| **5 Embedding** | `IEmbeddingProvider`, `IEmbeddingStore` scoped by `ownerId` (+ optional `workspaceId` in store API) | Unchanged |
| **6 Hybrid** | `CompositeRetrievalCandidateSource` | Unchanged |
| **7 Agents** | External runtime; REST/MCP boundary | Unchanged |
| **8 Graph** | **`IGraphProvider`** — traversal, edge CRUD beyond flat relations | `MemoryRelationService` delegates to port |
| **9 Multi-AI** | **`IAgentIdentity`**, **`ISyncManager`** — agent registry, conflict policy, shared workspace writes | Services gain scope via resolver, not new classes |
| **10 Enterprise** | **`IOrganizationStore`**, workspace RBAC, activate `organizationId` / `workspaceId` in auth + schema | `MemoryService` still orchestrates CRUD |

### Port sketches (contract only)

```typescript
// Phase 8
interface IGraphProvider {
  traverse(request: GraphTraversalRequest): Promise<string[]>; // memory IDs
  // edge operations mirror memory_relations semantics
}

// Phase 9
interface IAgentIdentity {
  register(agent: AgentDescriptor): Promise<string>;
  resolve(agentId: string, workspaceId: string): Promise<AgentContext>;
}

interface ISyncManager {
  reconcileWrite(event: MemoryWriteEvent): Promise<'accept' | 'merge' | 'reject'>;
}

// Phase 10
interface IWorkspaceMembership {
  assertAccess(userId: string, workspaceId: string, permission: Permission): Promise<void>;
}
```

---

## Mapping: today → target

| Today | Target |
|-------|--------|
| `owner_id = ''` MCP legacy pool | **Anti-pattern** — use default workspace under a real owner |
| `MCP_OWNER_ID` | Owner + implicit default workspace |
| `request.user.ownerId` | Owner; workspace from JWT claims (Phase 10) |
| `memories.project` | Project label (unchanged) |
| `memory_relations` | Backed by `IGraphProvider` D1 adapter (Phase 8) |

---

## Tradeoffs

- **Gain:** Phases 8–10 add **providers/adapters**, not service forks.
- **Gain:** Phase 5 can start immediately with `ownerId`-only scope.
- **Accept:** Nullable workspace/org columns come later—discipline on scope port design now.
- **Accept:** Full enterprise RBAC deferred to Phase 10; ADR-002 does not promise RBAC before then.

## Migration

| When | Action |
|------|--------|
| **Now (ADR only)** | Document model; reviews check new code against scope contract |
| **Phase 5–7** | Ports include `ownerId`; optional `workspaceId?` in types only (undefined) |
| **Phase 8** | Implement `IGraphProvider`; ADR + approved before code |
| **Phase 9** | Schema: `agents`, `workspaces`; `IScopeResolver`; `IAgentIdentity`, `ISyncManager` |
| **Phase 10** | Schema: `organizations`; workspace membership; JWT claims; enable filters |

No migration script in Phase 5.

## Rollback

This ADR is documentation-only until phase-specific ADRs implement schema. Revoking ADR-002 means future phases revert to owner-only model—no production data affected today.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| **5 Embedding** | Stores key by `(ownerId, memoryId)`; optional `workspaceId` in key prefix when live |
| **6 Hybrid Retrieval** | Filters include workspace when column exists; composite unchanged |
| **7 Agent Runtime** | Boundary OK; agents external; scope resolver prepares agent attribution |
| **8 Knowledge Graph** | **`IGraphProvider`** plugs in; `MemoryRelationService` unchanged at API |
| **9 Multi AI** | **`IAgentIdentity` + `ISyncManager`**; shared workspace without rewriting CRUD |
| **10 Enterprise** | **Organization/Workspace activated**; RBAC on membership port; audit per workspace |

**Explicit non-goals for ADR-002:** No tables, no endpoints, no MCP tool changes in this ADR.

---

## Implementation gate (Phases 5–7)

Before merging Phase 5+ code, verify:

- [ ] New ports accept `ownerId` (and optional future scope fields in types).
- [ ] No hard dependency on organization/workspace tables.
- [ ] No rename of `MemoryService`, `KnowledgeService`, `SearchService`.
- [ ] Cross-tenant isolation preserved (404 pattern).

---

## References

- [11-AI-RULES.md](../.ai/ai-rules/11-AI-RULES.md)
- [POLICY.md](POLICY.md)
- [ADR-001-multi-source-retrieval.md](001-multi-source-retrieval.md)
- [ADR-003-embedding-storage-mvp.md](003-embedding-storage-mvp.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
