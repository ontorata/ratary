# Phase 9.5 — Platform Architecture — MIGRATION

**Status:** N/A for schema — import-path migration only  
**ADR:** [ADR-008](../../../docs/adr/008-platform-architecture.md)

---

## Schema migrations

**None.** Phase 9.5 introduces TypeScript interfaces only. D1 schema unchanged.

---

## Adoption strategy

### Step 1 — Phase 9.5 (complete)

- Add `src/ports/**` and contract tests.
- Existing code continues importing from `repositories/`, `embedding/`, `graph/`.
- New enterprise work **must** import from `src/ports/index.js`.

### Step 2 — Composition root typing (Phase 10 prep)

- Declare `D1Client satisfies ISqlDatabase` at factory boundary (no SQL change).
- Add `createPlatformPorts()` factory returning port interfaces.

### Step 3 — Adapter bridges (Phase 10+)

| Legacy | Bridge | Target port |
|--------|--------|-------------|
| `D1Client` | `D1SqlDatabaseAdapter` | `ISqlDatabase` |
| `IEmbeddingStore` | `EmbeddingStoreVectorBridge` | `IVectorStore` |
| `IGraphProvider` | identity | `IGraphStore` |
| Inline `content` column | `InlineObjectStorage` (dev) | `IObjectStorage` |

### Step 4 — Provider swap (per ADR)

- Postgres: new `MemoryRepository` or internal reader/writer split (ADR-004 Phase 2).
- Vector: replace in-process D1 scan with pgvector/Pinecone adapter implementing `IVectorStore`.
- Object storage: R2 adapter per ADR-005.

### Step 5 — Service import migration (optional, low priority)

- Gradually change `import type { IMemoryRepository } from '../repositories/...'` → `'../ports/index.js'`.
- Re-exports guarantee identical types — zero runtime change per file.

---

## Rollback

Delete `src/ports/` directory and ADR-008 documentation. No database rollback required.

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md).*
