# Phase 09.7 — Memory Evolution — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-040 Accepted](../../../docs/adr/040-memory-evolution-version-control.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Stores | `memory_versions`, `memory_heads` + SQL adapters | ✅ |
| Coordinator | Archive pre-update on `updateMemory` | ✅ |
| Diff | `DefaultMemoryDiffEngine` field-level diff | ✅ |
| Merge | `DefaultMemoryMergePolicy` (field merge stub) | ✅ |
| Confidence | `DefaultVersionConfidenceScorer` | ✅ |
| Service | `MemoryEvolutionService` list + diff | ✅ |
| REST | `GET .../versions`, `GET .../versions/:n/diff` | ✅ |
| CLI | `evolution:history` | ✅ |
| Composition | `create-memory-evolution-ports.ts` | ✅ |
| Manifest | `supportsMemoryEvolution` | ✅ |

---

## File map

```
src/evolution/
  memory-evolution.types.ts
  memory-evolution-coordinator.ts
  memory-evolution.service.ts
  default-memory-diff-engine.ts
  default-memory-merge-policy.ts
  default-version-confidence-scorer.ts
  index.ts
src/infrastructure/evolution/
  sql-memory-version-store.ts
  sql-memory-head-store.ts
src/composition/create-memory-evolution-ports.ts
src/controllers/evolution.controller.ts
src/routes/v1/evolution.routes.ts
scripts/evolution-history.ts
```

---

## Wiring

```typescript
createMemoryEvolutionPorts(sql, env) → { coordinator, service, mergePolicy }

createMemoryService(..., evolutionPorts.coordinator)
  createMemory → coordinator.onMemoryCreated (init head)
  updateMemory → coordinator.onMemoryUpdated (archive pre-update snapshot)
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `MEMORY_EVOLUTION_ENABLED` | `false` | Master switch |
| `MEMORY_EVOLUTION_STORE_PROVIDER` | `none` | `sql` \| `none` |

---

## Rollback

Set `MEMORY_EVOLUTION_ENABLED=false`; CRUD uses in-place path only. Version rows remain append-only.
