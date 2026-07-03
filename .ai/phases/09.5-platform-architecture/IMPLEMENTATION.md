# Phase 9.5 — Platform Architecture — IMPLEMENTATION

**Status:** 🔄 Ports delivered  
**ADR:** [ADR-008](../../../docs/adr/008-platform-architecture.md)

---

## Folder structure

```
src/
  ports/                          ← NEW canonical port registry
    index.ts                      ← barrel export
    sql/isql-database.port.ts
    memory/imemory-repository.port.ts
    relation/irelation-repository.port.ts
    embedding/iembedding-provider.port.ts
    vector/ivector-store.port.ts
    graph/igraph-store.port.ts
    storage/iobject-storage.port.ts
    cache/icache.port.ts
    events/ievent-bus.port.ts
    analytics/ianalytics-store.port.ts

  repositories/                   ← unchanged — D1 adapters
  embedding/                      ← unchanged — IEmbeddingStore legacy + providers
  graph/                          ← unchanged — IGraphProvider
  db/                             ← unchanged — D1Client
  services/                       ← unchanged — no import of vendor types added
```

## Modules delivered

| Deliverable | Path |
|-------------|------|
| Platform barrel | `src/ports/index.ts` |
| SQL port | `src/ports/sql/isql-database.port.ts` |
| Memory port (re-export) | `src/ports/memory/imemory-repository.port.ts` |
| Relation port (alias) | `src/ports/relation/irelation-repository.port.ts` |
| Embedding port (re-export) | `src/ports/embedding/iembedding-provider.port.ts` |
| Vector port (new) | `src/ports/vector/ivector-store.port.ts` |
| Graph port (alias) | `src/ports/graph/igraph-store.port.ts` |
| Object storage port (new) | `src/ports/storage/iobject-storage.port.ts` |
| Cache port (new) | `src/ports/cache/icache.port.ts` |
| Event bus port (new) | `src/ports/events/ievent-bus.port.ts` |
| Analytics port (new) | `src/ports/analytics/ianalytics-store.port.ts` |
| Contract tests | `tests/ports/platform-ports.test.ts` |
| ADR | `docs/adr/008-platform-architecture.md` |

## Explicitly not changed

- `MemoryService`, controllers, MCP tools — **no edits**
- `MemoryRepository` SQL — **no edits**
- Composition roots (`server.ts`, `mcp/server.ts`) — **no edits**
- Runtime behavior — **identical**

## Future adapter placement (Phase 10+)

```
src/infrastructure/             ← future (not created in 9.5)
  sql/d1-sql-database.adapter.ts
  sql/postgres-sql-database.adapter.ts
  vector/pgvector-store.adapter.ts
  storage/r2-object-storage.adapter.ts
  cache/redis-cache.adapter.ts
  events/kafka-event-bus.adapter.ts
```

Adapters implement ports; wired only in composition roots.

---

*Do not contradict [ADR-008](../../../docs/adr/008-platform-architecture.md).*
