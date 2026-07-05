# Phase 16 — ARCHITECTURE_UPDATE

**Target document:** [.ai/core/architecture/04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Apply when:** ADR-031 **Approved** and Phase 16 implementation begins.

---

## Sections to add or extend

### 1. Developer platform layer (new subsection under Enterprise)

Add after "Enterprise platform layers (Phases 16–20 — planned)":

- **`packages/` monorepo slice** — SDK, CLI, Dashboard, installable MCP server.
- Explicit **client-only** boundary: no imports from `src/services/` into `packages/`.
- Generation SSOT: OpenAPI snapshot + Phase 13 proto.

### 2. Dependency diagram update

Extend enterprise diagram:

```
packages/sdk → REST | gRPC | Remote MCP → Server handlers → MemoryService
packages/cli → sdk
apps/dashboard → sdk
packages/mcp-server → sdk
```

### 3. Auth layer note

Document that SDK/CLI pass through existing auth headers (API key, JWT) — no new server auth ports.

### 4. Protocol layer cross-reference

Link Phase 13 `IRestTransport`, `IGrpcTransport` as **server-side**; SDK transports are **mirror clients**, not duplicates.

---

## Sections unchanged

- MemoryService, ContextService, SearchService contracts
- Repository pattern and `src/` layering
- Agent runtime prohibition (external only)

---

## Verification checklist

- [ ] 04-ARCHITECTURE states "Phase 16 = zero server business logic change"
- [ ] No new server ports listed for Phase 16
- [ ] Link to ADR-031 and `16-developer-platform/DESIGN.md`
