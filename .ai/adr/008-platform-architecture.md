# ADR-008: Platform Architecture — Storage-Agnostic Ports

**Status:** Implemented  
**Date:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phases 1–9 implemented a **Cloudflare D1–optimized** memory foundation. Phase 10 (Enterprise) and beyond require swappable infrastructure: PostgreSQL, object storage, dedicated vector/graph engines, cache, analytics, and event buses — **without rewriting** `MemoryService`, domain logic, or REST/MCP contracts.

Ports already exist in domain folders (`IMemoryRepository`, `IEmbeddingProvider`, `IGraphProvider`, …) but are scattered and named for current adapters (`IEmbeddingStore`, `D1Client`).

## Problem

1. **No single platform port registry** — new contributors import concrete paths and D1 types from composition roots.
2. **Naming tied to MVP** — `IEmbeddingStore` implies storage shape; enterprise vector backends (Pinecone, pgvector) need vendor-neutral `IVectorStore`.
3. **Missing extension points** — cache, analytics, event bus, object storage, and SQL abstraction have ADR intent but no canonical interfaces in one layer.
4. **Phase 10 blocked** without a declared Application → Domain → **Ports** → Infrastructure → Storage stack.

## Constraints

- **No new user-facing features** in Phase 9.5.
- **No new provider implementations** — interfaces and documentation only.
- **Zero behavior change** to existing REST/MCP paths and business logic.
- Constitution: inward dependencies; services never import vendor SDKs.
- D1 remains the default production adapter until a future ADR schedules swap.
- One concern per commit when implementing follow-up adapter work.

## Alternatives

### Option A — Central `src/ports/` registry; re-export existing interfaces; add missing ports

- Pros: Low risk; DIP preserved; clear enterprise extension map; no service churn.
- Cons: Temporary duplication of names (`IEmbeddingStore` vs `IVectorStore`) until adapter bridges land.

### Option B — Move all interfaces into `src/ports/` and update every import immediately

- Pros: Single folder immediately.
- Cons: Large churn; violates “no business logic change” for Phase 9.5.

### Option C — Defer until Phase 10 Postgres ADR

- Pros: Less work now.
- Cons: Enterprise planning lacks contract surface; adapters would be ad hoc.

## Decision

**Adopt Option A — Phase 9.5 Platform Architecture:**

Introduce `src/ports/` as the **canonical platform port registry**:

| Port | Module | Notes |
|------|--------|-------|
| `ISqlDatabase` | `ports/sql/` | Vendor-neutral SQL; D1 structurally compatible |
| `IMemoryRepository` | `ports/memory/` | Re-export existing contract |
| `IRelationRepository` | `ports/relation/` | Alias of `IMemoryRelationRepository` |
| `IEmbeddingProvider` | `ports/embedding/` | Re-export existing contract |
| `IVectorStore` | `ports/vector/` | New canonical vector port |
| `IGraphStore` | `ports/graph/` | Alias of `IGraphProvider` |
| `IObjectStorage` | `ports/storage/` | Aligns with ADR-005 intent |
| `ICache` | `ports/cache/` | New |
| `IEventBus` | `ports/events/` | New |
| `IAnalyticsStore` | `ports/analytics/` | New |

Existing implementations (`MemoryRepository`, `D1EmbeddingStore`, `D1GraphAdapter`, …) **remain in place** as infrastructure adapters. Composition roots may continue using `D1Client` until a follow-up ADR wires `ISqlDatabase`.

## Tradeoffs

- **Gain:** Enterprise backends pluggable without domain rewrites; explicit dependency diagram for Phase 10.
- **Accept:** Dual naming during transition (`IEmbeddingStore` / `IVectorStore`, `IGraphProvider` / `IGraphStore`).
- **Accept:** Repositories still accept `D1Client` until adapter refactor (Phase 10+).

## Migration

### Phase 9.5 (this ADR — ports only)

1. Add `src/ports/**` interfaces and `src/ports/index.ts`.
2. Add structural contract tests (`tests/ports/platform-ports.test.ts`).
3. Document folder layout, risks, and test strategy in `.ai/phases/09.5-platform-architecture/`.
4. **No** import rewrites in services; **no** new adapters.

### Phase 10+ (future ADRs)

1. `D1Client implements ISqlDatabase` (typing only at composition root).
2. `VectorStoreBridge`: `IEmbeddingStore` → `IVectorStore` for D1 MVP adapter.
3. Optional: `PostgresMemoryRepository implements IMemoryRepository`.
4. Wire `IObjectStorage` per ADR-005 when R2 adapter approved.
5. Introduce `ICache` / `IEventBus` / `IAnalyticsStore` adapters only when enterprise features require them.

## Rollback

- Delete `src/ports/` and revert ADR-008; zero runtime impact (ports unused by composition roots in 9.5).

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 9.5 Platform | Declares port registry; no feature change |
| 10 Enterprise | Postgres, RBAC, audit → `ISqlDatabase`, `IAnalyticsStore`, `IEventBus` |
| 10+ Vector scale | `IVectorStore` adapters (pgvector, Pinecone, …) replace D1 in-process search |
| 10+ Graph scale | `IGraphStore` adapters (Neo4j, …) optional alongside flat relations |
| Content offload | `IObjectStorage` implements ADR-005 |

---

## References

- [ADR-004 Repository port types](004-repository-port-types.md)
- [ADR-005 Content object store](005-content-object-store.md)
- [ADR-006 Graph provider](006-igraph-provider.md)
- [04-ARCHITECTURE.md](../../.ai/core/architecture/04-ARCHITECTURE.md)
- [11-AI-RULES.md](../../.ai/core/ai-rules/11-AI-RULES.md)
