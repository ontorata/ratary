# ADR-007: Multi-AI Workspace Scope

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phases 1–8 are complete. Phase 8 delivered graph-augmented retrieval via `IGraphProvider` ([ADR-006](006-igraph-provider.md)). Today all memory operations scope by flat **`owner_id`** only ([ADR-002](002-workspace-identity-model.md) contract).

Phase 9 requires **multiple AI clients** (Cursor, Claude, bots) to share a **workspace-scoped memory pool** with **agent attribution** on writes — without rewriting `MemoryService`, `KnowledgeService`, or `SearchService`.

Design reference: [.ai/phases/09-multi-ai/DESIGN.md](../../.ai/phases/09-multi-ai/DESIGN.md)

---

## Problem

| Gap today | Phase 9 need |
|-----------|--------------|
| Single implicit pool per `owner_id` | Named **workspaces** as shared brain boundary |
| No agent identity on writes | **Agent attribution** (which AI/client wrote this?) |
| MCP = one owner env | MCP client → **agent** binding inside workspace |
| Cross-client concurrent writes | **Sync policy** (MVP: last-write-wins + audit) |
| Repository filters `owner_id` only | **`workspace_id`** filter when column live |

Without an implementation ADR, Phase 9 risks ad-hoc columns, service forks, or MCP contract breaks.

---

## Constraints

- [ADR-002](002-workspace-identity-model.md): extend `MemoryScope` additively; **`IScopeResolver`** at composition root.
- **No `MemoryServiceV2`** — scope injected via resolver; core method signatures unchanged.
- **`owner_id` remains valid** indefinitely; solo users get implicit default workspace.
- MCP/REST Phase 1–8 contracts **unchanged**; workspace/agent fields **additive only**.
- **Organization / RBAC deferred to Phase 10** — no `organizations` table in Phase 9.
- Owner isolation preserved; **workspace isolation** enforced (404 pattern, same as cross-owner).
- One concern per commit; implementation only after ADR **Approved**.

---

## Alternatives

### Option A — Workspace + agent ports, additive schema, `IScopeResolver` at composition root

- Pros: Matches ADR-002; testable ports; backfill path for existing data; no service rewrite.
- Cons: Schema migration + repository filter updates across read/write paths.

### Option B — Encode workspace in `project_id` string convention

- Pros: No schema change.
- Cons: Not a security boundary; breaks ADR-002 invariants; rejected.

### Option C — Replace `owner_id` with `workspace_id` only

- Pros: Clean multi-tenant model.
- Cons: **Breaking** MCP, REST, 231 tests, production data; rejected per ADR-002 Option C.

---

## Decision

**Adopt Option A:**

1. **Schema (Phase 9 migration):**
   - `workspaces` — `(id, owner_id, name, slug, created_at)`; unique `(owner_id, slug)`.
   - `agents` — `(id, workspace_id, owner_id, name, client_id?, agent_type, metadata, created_at, active)`.
   - `memories.workspace_id` — nullable → backfill → NOT NULL (via default workspace per owner).
   - Optional: `memories.last_modified_by_agent_id` for attribution (nullable).

2. **`MemoryScope` extension (types only until wired):**
   ```typescript
   interface MemoryScope {
     ownerId: string;
     workspaceId?: string;   // Phase 9 — required at runtime after migration
     agentId?: string;       // Phase 9 — actor attribution
     projectId?: string;     // existing filter hint
   }
   ```

3. **`IScopeResolver` port** — resolves effective scope from REST auth / MCP env:
   - REST: `ownerId` from auth; `workspaceId` from header `X-Workspace-Id` or default workspace.
   - MCP: `MCP_OWNER_ID` + optional `MCP_WORKSPACE_ID` + optional `MCP_AGENT_ID`.

4. **`IAgentIdentity` port** — register/resolve agents within a workspace; link to existing `clients` row when present.

5. **`ISyncManager` port (MVP):** `reconcileWrite` → **`accept`** with audit metadata; detect stale `updated_at` and log `sync.conflict` event (no automatic merge in MVP).

6. **Repository rule:** all memory reads/writes add `workspace_id = ?` when scope includes `workspaceId` (after backfill).

7. **Composition root** wires resolver before controllers/MCP tools; **`MemoryService` unchanged** — still accepts `MemoryScope`.

8. **Additive API:**
   - REST: optional header `X-Workspace-Id`; optional `agentId` in audit metadata.
   - MCP: optional env `MCP_WORKSPACE_ID`, `MCP_AGENT_ID`; tools unchanged (scope from env).

---

## Tradeoffs

- **Gain:** Multi-client shared workspace without service rewrite.
- **Gain:** Agent attribution path for audit and future sync policies.
- **Accept:** MVP sync = last-write-wins; advanced merge deferred.
- **Accept:** Graph/embedding legs filter by `owner_id` today; workspace filter on graph traversal added when `memories.workspace_id` live (adapter parameter, ADR-006 note).
- **Accept:** No org/RBAC until Phase 10.

---

## Migration

Implementation order (after ADR **Approved**):

1. **Types + ports** — `MemoryScope`, `IScopeResolver`, `IAgentIdentity`, `ISyncManager` interfaces.
2. **Schema migration** — `workspaces`, `agents`, `memories.workspace_id`; indexes.
3. **Backfill script** — create default workspace per distinct `owner_id`; set `memories.workspace_id`.
4. **`DefaultScopeResolver` + tests** — REST header + MCP env; default workspace fallback.
5. **`D1AgentIdentity` adapter + tests** — CRUD/register agents.
6. **`AcceptSyncManager` (MVP) + tests** — accept writes; conflict audit log only.
7. **Repository workspace filter** — `MemoryRepository` (and relation paths via memory ownership).
8. **Composition wiring** — `server.ts`, `mcp/server.ts`, auth hooks.
9. **Cross-workspace isolation E2E** — extend `cross-owner-leak.test.ts` pattern.
10. **Optional additive REST/MCP** — list workspaces, register agent endpoints (separate commits).

No removal of `owner_id` filters.

---

## Rollback

- Revert workspace filter in repositories (owner-only queries).
- Set `workspace_id` column unused (nullable); drop tables in forward migration rollback script.
- Remove resolver wiring; restore flat `MemoryScope { ownerId }` at composition root.

---

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 5 Embedding | Store keys gain optional workspace prefix when filtering |
| 6 Hybrid | Retrieval filters include `workspaceId` when set |
| 7 Agent Runtime | External agents consume workspace-scoped API |
| 8 Graph | `IGraphProvider` / graph retrieval accept workspace filter (additive) |
| 9 Multi-AI | **Primary enabler** |
| 10 Enterprise | `organizationId`, membership RBAC, JWT claims build on workspaces |

---

## References

- [ADR-002: Workspace Identity Model](002-workspace-identity-model.md)
- [ADR-004: Repository Port Types](004-repository-port-types.md)
- [ADR-006: Graph Provider](006-igraph-provider.md)
- [Phase 9 DESIGN](../../.ai/phases/09-multi-ai/DESIGN.md)
- [POLICY.md](POLICY.md)

---

## Appendix A: Port contracts (proposed)

```typescript
interface IScopeResolver {
  resolveFromRequest(auth: AuthUser, hints?: { workspaceId?: string }): Promise<MemoryScope>;
  resolveFromMcp(env: { ownerId: string; workspaceId?: string; agentId?: string }): MemoryScope;
}

interface IAgentIdentity {
  register(scope: MemoryScope, descriptor: AgentDescriptor): Promise<AgentRecord>;
  resolve(scope: MemoryScope, agentId: string): Promise<AgentRecord | null>;
  listByWorkspace(scope: MemoryScope): Promise<AgentRecord[]>;
}

interface ISyncManager {
  reconcileWrite(event: MemoryWriteEvent): Promise<'accept' | 'reject'>;
}
```

## Appendix B: Environment flags (proposed)

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_WORKSPACE_ID` | *(default workspace)* | MCP memory workspace |
| `MCP_AGENT_ID` | *(none)* | MCP agent attribution |

REST: header `X-Workspace-Id` (optional).

## Appendix C: Default workspace semantics

- One **`default`** workspace per `owner_id` (slug `default`).
- Created lazily on bootstrap or first scoped operation.
- All pre-migration memories backfilled to owner's default workspace.

---

*Approved — implementation may proceed per Migration section.*
