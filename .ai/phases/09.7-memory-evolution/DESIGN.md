# Phase 09.7 — Memory Evolution — DESIGN

**Document:** DESIGN  
**Phase status:** ✅ Implemented (2026-07-04) · ADR-040 Accepted  
**ADR gate:** [ADR-040](../../../docs/adr/040-memory-evolution-version-control.md) — **Accepted**

---

## Purpose

Enable memories to evolve over time with immutable versions and a Current head pointer. Distinct from duplicate rollup (04.7) and federation merge (14).

## Side-store model

| Store | Role |
|-------|------|
| `memories` | Current head — default CRUD reads/writes |
| `memory_versions` | Immutable snapshots (pre-update archive) |
| `memory_heads` | Version counter + branch name per memory |

## Ports

| Port | Implementation | Status |
|------|----------------|--------|
| `IMemoryVersionStore` | `SqlMemoryVersionStore` | ✅ |
| `IMemoryHeadStore` | `SqlMemoryHeadStore` | ✅ |
| `IMemoryDiffEngine` | `DefaultMemoryDiffEngine` | ✅ |
| `IMemoryMergePolicy` | `DefaultMemoryMergePolicy` | ✅ |
| `IVersionConfidenceScorer` | `DefaultVersionConfidenceScorer` | ✅ |
| Coordinator | `MemoryEvolutionCoordinator` | ✅ |

## MemoryService impact

Facade hook when enabled — **signatures unchanged** when disabled.

## Boundaries

- Current head remains in `memories`; `memory_versions` is append-only side store
- Distinct from Phase 04.7 duplicate rollup and Phase 14 federation merge
- REST list/diff endpoints gated — no REST API v2
- Branch merge execute and restore-to-version deferred post-gate

## Success criteria

- [x] ADR-040 Accepted
- [x] Pre-update snapshots on `updateMemory`
- [x] Head init on `createMemory`
- [x] REST list + diff endpoints (gated)
- [x] Flag off = zero regression
- [ ] Branch/merge execute path (deferred)
- [ ] Restore-to-version mutation (deferred)

## Non-goals

- REST API v2
- In-place destructive history rewrite
- LLM-assisted merge
